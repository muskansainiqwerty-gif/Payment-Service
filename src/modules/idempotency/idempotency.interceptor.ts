import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { IdempotencyService } from './idempotency.service';

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(private readonly idempotencyService: IdempotencyService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const idempotencyKey = request.headers['x-idempotency-key'] as string;

    if (!idempotencyKey) {
      return next.handle();
    }

    const cacheKey = this.idempotencyService.buildStoreKey(
      request.route?.path || request.path,
      idempotencyKey,
    );

    request.idempotencyMeta = {
      cacheKey,
      requestHash: this.idempotencyService.buildRequestHash(request.body),
      idempotencyKey,
    };
    return next.handle();
  }
}
