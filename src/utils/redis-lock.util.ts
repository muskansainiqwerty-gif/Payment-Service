import { Injectable } from '@nestjs/common';
import { MyService } from '../common/redis/redis.service';

@Injectable()
export class RedisLockUtil {
  constructor(private readonly redisService: MyService) {}

  async acquireLock(lockKey: string, ttlSeconds: number): Promise<boolean> {
    const existingLock = await this.redisService.get(lockKey);
    if (existingLock) {
      return false;
    }
    await this.redisService.set(lockKey, 'locked', ttlSeconds);
    return true;
  }

  async releaseLock(lockKey: string): Promise<void> {
    await this.redisService.delete(lockKey);
  }
}
