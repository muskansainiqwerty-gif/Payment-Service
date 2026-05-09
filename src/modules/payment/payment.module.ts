import { Module, forwardRef } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PaymentRepository } from './payment.repository';
import { QueueModule } from '../queue/queue.module';
import { GatewayModule } from '../gateway/gateway.module';
import { IdempotencyModule } from '../idempotency/idempotency.module';
import { RedisLockUtil } from '../../utils/redis-lock.util';
import { DatabaseModule } from '../../common/database/database.module';

@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => QueueModule),
    GatewayModule,
    IdempotencyModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService, PaymentRepository, RedisLockUtil],
  exports: [PaymentService, PaymentRepository],
})
export class PaymentModule {}
