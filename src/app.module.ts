import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisModules } from './common/redis/redis.module';
import { DatabaseModule } from './common/database/database.module';

import EscapeXssMiddleware from './middleware/escapeXssMiddleware';
import { ThrottlerModule } from '@nestjs/throttler';
import { PaymentModule } from './modules/payment/payment.module';
import { QueueModule } from './modules/queue/queue.module';
import { GatewayModule } from './modules/gateway/gateway.module';
import { WebhookModule } from './modules/webhook/webhook.module';
import { IdempotencyModule } from './modules/idempotency/idempotency.module';
import { RabbitMqModule } from './modules/rabbitmq/rabbitmq.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 2000,
        limit: 10,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 40,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 200,
      },
    ]),
    DatabaseModule,
    RedisModules,
    GatewayModule,
    IdempotencyModule,
    RabbitMqModule,
    PaymentModule,
    QueueModule,
    WebhookModule,
  ],
  providers: [],
  controllers: [],
  exports: [],
})
export class AppModule implements NestModule {
  configure(user: MiddlewareConsumer) {
    user.apply(EscapeXssMiddleware).forRoutes('/*');
  }
}
