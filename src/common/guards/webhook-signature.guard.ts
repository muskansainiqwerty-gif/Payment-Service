import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createHmac } from 'crypto';
import { RAZORPAY_HEADERS } from '../../modules/payment/constants/payment.constants';

@Injectable()
export class WebhookSignatureGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const incomingSignatureRaw = request.headers[RAZORPAY_HEADERS.SIGNATURE] as
      | string
      | undefined;
    if (!incomingSignatureRaw) {
      throw new UnauthorizedException('Missing webhook signature');
    }

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      throw new UnauthorizedException('Webhook secret not configured');
    }

    const payload = JSON.stringify(request.body ?? {});
    const expectedSignature = createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    const incomingSignature = incomingSignatureRaw
      .trim()
      .replace(/^sha256=/i, '')
      .toLowerCase();
    if (incomingSignature !== expectedSignature.toLowerCase()) {
      throw new UnauthorizedException('Invalid webhook signature');
    }
    return true;
  }
}
