import { Injectable } from '@nestjs/common';
import { WebhookEvent } from '../payment/models/webhook-event.model';
import { PaymentService } from '../payment/payment.service';
import { WebhookEventDto } from './dto/webhook-event.dto';

@Injectable()
export class WebhookService {
  constructor(private readonly paymentService: PaymentService) {}

  async processWebhook(payload: WebhookEventDto, signature: string) {
    const existing = await WebhookEvent.findOne({
      where: { eventId: payload.eventId },
    });
    if (existing) {
      return existing;
    }

    const savedEvent = await WebhookEvent.create({
      eventId: payload.eventId,
      signature,
      payload: payload.payload || payload,
    } as any);

    if (payload.orderId) {
      const success = (payload.status || '').toLowerCase() === 'success';
      await this.paymentService.markPaymentFromWebhook(
        payload.orderId,
        success,
        payload.payload || payload,
      );
    }

    savedEvent.processedAt = new Date();
    await savedEvent.save();
    return savedEvent;
  }
}
