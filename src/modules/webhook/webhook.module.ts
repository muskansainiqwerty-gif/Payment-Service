import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { PaymentModule } from '../payment/payment.module';
import { WebhookSignatureGuard } from '../../common/guards/webhook-signature.guard';

@Module({
  imports: [PaymentModule],
  controllers: [WebhookController],
  providers: [WebhookService, WebhookSignatureGuard],
})
export class WebhookModule {}
