import { Module, forwardRef } from '@nestjs/common';
import { PaymentProducer } from './payment.producer';
import { PaymentProcessor } from './payment.processor';
import { PaymentModule } from '../payment/payment.module';
import { RabbitMqModule } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitMqModule, forwardRef(() => PaymentModule)],
  providers: [PaymentProducer, PaymentProcessor],
  exports: [PaymentProducer],
})
export class QueueModule {}
