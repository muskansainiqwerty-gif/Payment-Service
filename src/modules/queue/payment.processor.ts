import {
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
  forwardRef,
} from '@nestjs/common';
import { ConsumeMessage } from 'amqplib';
import { PaymentService } from '../payment/payment.service';
import {
  PAYMENT_MAX_RETRIES,
  PAYMENT_QUEUE_NAME,
  PAYMENT_RETRY_DELAY_MS,
  PAYMENT_RETRY_QUEUE_NAME,
} from '../payment/constants/payment.constants';
import { RabbitMqService } from '../rabbitmq/rabbitmq.service';

@Injectable()
export class PaymentProcessor implements OnModuleInit {
  private readonly logger = new Logger(PaymentProcessor.name);

  constructor(
    @Inject(forwardRef(() => PaymentService))
    private readonly paymentService: PaymentService,
    private readonly rabbitMqService: RabbitMqService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.rabbitMqService.assertQueue(PAYMENT_QUEUE_NAME, {
      durable: true,
    });
    await this.rabbitMqService.assertQueue(PAYMENT_RETRY_QUEUE_NAME, {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': '',
        'x-dead-letter-routing-key': PAYMENT_QUEUE_NAME,
        'x-message-ttl': PAYMENT_RETRY_DELAY_MS,
      },
    });
    await this.rabbitMqService.prefetch(1);
    await this.rabbitMqService.consume(
      PAYMENT_QUEUE_NAME,
      async (message) => this.handleMessage(message),
      { noAck: false },
    );
  }

  async processPayment(paymentId: string): Promise<void> {
    await this.paymentService.processPayment(paymentId);
  }

  private async handleMessage(message: ConsumeMessage): Promise<void> {
    const payload = JSON.parse(message.content.toString() || '{}');
    const paymentId = payload.paymentId as string;
    const retryCount =
      Number(message.properties.headers?.['x-retry-count'] || 0) || 0;

    try {
      await this.processPayment(paymentId);
      await this.rabbitMqService.ack(message);
    } catch (error) {
      this.logger.error(
        `Payment processing failed for ${paymentId}, retry=${retryCount}`,
        (error as Error).stack,
      );
      if (retryCount < PAYMENT_MAX_RETRIES) {
        await this.rabbitMqService.sendToQueue(
          PAYMENT_RETRY_QUEUE_NAME,
          { paymentId },
          {
            persistent: true,
            headers: {
              'x-retry-count': retryCount + 1,
            },
          },
        );
      } else {
        await this.paymentService.markPaymentFailed(
          paymentId,
          (error as Error).message,
        );
      }
      await this.rabbitMqService.ack(message);
    }
  }
}
