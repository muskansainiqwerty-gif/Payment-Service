import { Injectable } from '@nestjs/common';
import { PAYMENT_QUEUE_NAME } from '../payment/constants/payment.constants';
import { RabbitMqService } from '../rabbitmq/rabbitmq.service';

@Injectable()
export class PaymentProducer {
  constructor(private readonly rabbitMqService: RabbitMqService) {}

  async enqueuePayment(paymentId: string): Promise<void> {
    await this.rabbitMqService.assertQueue(PAYMENT_QUEUE_NAME, {
      durable: true,
    });
    await this.rabbitMqService.sendToQueue(
      PAYMENT_QUEUE_NAME,
      { paymentId },
      { persistent: true },
    );
  }
}
