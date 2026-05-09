import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { MyService } from '../../common/redis/redis.service';
import {
  IDEMPOTENCY_KEY_PREFIX,
  IDEMPOTENCY_TTL_SECONDS,
} from '../payment/constants/payment.constants';
import { IdempotencyRecord } from '../payment/models/idempotency-record.model';

@Injectable()
export class IdempotencyService {
  constructor(private readonly redisService: MyService) {}

  buildRequestHash(payload: unknown): string {
    return createHash('sha256')
      .update(JSON.stringify(payload ?? {}))
      .digest('hex');
  }

  buildStoreKey(path: string, idempotencyKey: string): string {
    return `${IDEMPOTENCY_KEY_PREFIX}:${path}:${idempotencyKey}`;
  }

  async getCachedResponse(key: string): Promise<Record<string, any> | null> {
    const value = await this.redisService.get(key);
    return value ? JSON.parse(value) : null;
  }

  async setCachedResponse(
    key: string,
    responsePayload: Record<string, any>,
    ttlSeconds = IDEMPOTENCY_TTL_SECONDS,
  ): Promise<void> {
    await this.redisService.set(
      key,
      JSON.stringify(responsePayload),
      ttlSeconds,
    );
  }

  async findValidRecord(key: string): Promise<IdempotencyRecord | null> {
    const record = await IdempotencyRecord.findOne({ where: { key } });
    if (!record) {
      return null;
    }
    if (new Date(record.expiresAt).getTime() < Date.now()) {
      return null;
    }
    return record;
  }

  async upsertRecord(
    key: string,
    requestHash: string,
    response: Record<string, any>,
    statusCode = 201,
    ttlSeconds = IDEMPOTENCY_TTL_SECONDS,
  ): Promise<IdempotencyRecord> {
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
    const existing = await IdempotencyRecord.findOne({ where: { key } });
    if (existing) {
      existing.requestHash = requestHash;
      existing.response = response;
      existing.statusCode = statusCode;
      existing.expiresAt = expiresAt;
      await existing.save();
      return existing;
    }
    return IdempotencyRecord.create({
      key,
      requestHash,
      response,
      statusCode,
      expiresAt,
    } as any);
  }
}
