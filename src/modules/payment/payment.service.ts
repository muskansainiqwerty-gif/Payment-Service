import {
  BadRequestException,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { PaymentRepository } from './payment.repository';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentStatus } from './enums/payment-status.enum';
import { PaymentProducer } from '../queue/payment.producer';
import { GatewayService } from '../gateway/gateway.service';
import { RedisLockUtil } from '../../utils/redis-lock.util';
import { PAYMENT_LOCK_PREFIX } from './constants/payment.constants';
import { PaginatePaymentDto } from './dto/paginate-payment.dto';
import { IdempotencyService } from '../idempotency/idempotency.service';

@Injectable()
export class PaymentService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    @Inject(forwardRef(() => PaymentProducer))
    private readonly paymentProducer: PaymentProducer,
    private readonly gatewayService: GatewayService,
    private readonly idempotencyService: IdempotencyService,
    private readonly redisLockUtil: RedisLockUtil,
  ) {}

  async createPayment(
    dto: CreatePaymentDto,
    userId: string,
    idempotencyMeta?: {
      idempotencyKey?: string;
      requestHash?: string;
      cacheKey?: string;
    },
  ) {
    if (idempotencyMeta?.idempotencyKey && idempotencyMeta?.requestHash) {
      const scopedRecordKey =
        idempotencyMeta.cacheKey ||
        `payments:${idempotencyMeta.idempotencyKey}`;
      const existingRecord = await this.idempotencyService.findValidRecord(
        scopedRecordKey,
      );
      if (existingRecord) {
        if (existingRecord.requestHash !== idempotencyMeta.requestHash) {
          throw new BadRequestException(
            'Idempotency key already used with different payload.',
          );
        }
        const paymentId = existingRecord.response?.paymentId;
        if (paymentId) {
          const payment = await this.paymentRepository.findById(paymentId);
          if (payment) {
            return payment;
          }
        }
      }
    }

    const payment = await this.paymentRepository.createPayment({
      userId,
      orderId: `MB_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      amount: dto.amount,
      currency: dto.currency || 'INR',
      status: PaymentStatus.PENDING,
      metadata: dto.metadata || {},
      idempotencyKey: idempotencyMeta?.idempotencyKey || null,
    });

    void this.paymentProducer.enqueuePayment(payment.id);

    if (idempotencyMeta?.idempotencyKey && idempotencyMeta?.requestHash) {
      const scopedRecordKey =
        idempotencyMeta.cacheKey ||
        `payments:${idempotencyMeta.idempotencyKey}`;
      await this.idempotencyService.upsertRecord(
        scopedRecordKey,
        idempotencyMeta.requestHash,
        {
          paymentId: payment.id,
          orderId: payment.orderId,
          userId,
        },
        201,
      );
      await this.idempotencyService.setCachedResponse(scopedRecordKey, {
        paymentId: payment.id,
        orderId: payment.orderId,
        requestHash: idempotencyMeta.requestHash,
      });
    }

    return {
      ...payment.get({ plain: true }),
      status: PaymentStatus.PENDING,
    };
  }

  async processPayment(paymentId: string): Promise<void> {
    const lockKey = `${PAYMENT_LOCK_PREFIX}:${paymentId}`;
    const lockAcquired = await this.redisLockUtil.acquireLock(lockKey, 30);
    if (!lockAcquired) {
      return;
    }

    try {
      const payment = await this.paymentRepository.findById(paymentId);
      if (!payment || payment.status !== PaymentStatus.PENDING) {
        return;
      }

      await this.paymentRepository.updateStatus(
        paymentId,
        PaymentStatus.PROCESSING,
      );
      const gatewayResponse = await this.gatewayService.charge({
        orderId: payment.orderId,
        amount: Number(payment.amount),
        currency: payment.currency,
      });

      await this.paymentRepository.updateStatus(
        paymentId,
        PaymentStatus.SUCCESS,
        {
          gatewayPaymentId: gatewayResponse.paymentId,
          gatewayOrderId: gatewayResponse.gatewayOrderId,
          gatewayResponse: gatewayResponse.raw,
        } as any,
      );
    } catch (error) {
      await this.paymentRepository.updateStatus(
        paymentId,
        PaymentStatus.PENDING,
        {
          failureReason: (error as Error).message,
        } as any,
      );
      throw error;
    } finally {
      await this.redisLockUtil.releaseLock(lockKey);
    }
  }

  async markPaymentFailed(paymentId: string, reason: string): Promise<void> {
    await this.paymentRepository.updateStatus(paymentId, PaymentStatus.FAILED, {
      failureReason: reason,
    } as any);
  }

  async getPaymentById(id: string) {
    return this.paymentRepository.findById(id);
  }

  async getUserPayments(userId: string, query: PaginatePaymentDto) {
    return this.paymentRepository.paginateByUserId(userId, query);
  }

  async markPaymentFromWebhook(
    orderId: string,
    success: boolean,
    payload: any,
  ) {
    const payment = await this.paymentRepository.findByOrderId(orderId);
    if (!payment) {
      return null;
    }
    await this.paymentRepository.updateStatus(
      payment.id,
      success ? PaymentStatus.SUCCESS : PaymentStatus.FAILED,
      {
        gatewayResponse: payload,
      } as any,
    );
    return this.paymentRepository.findById(payment.id);
  }
}
