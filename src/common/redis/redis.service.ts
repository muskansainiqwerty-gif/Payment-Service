import { RedisService } from "@liaoliaots/nestjs-redis";
import { Injectable } from "@nestjs/common";

@Injectable()
export class MyService {
  clientInternal: any;
  constructor(private readonly redisService: RedisService) { }

  async setValue(key: string, field: string, value: string): Promise<void> {
    const client = this.redisService.getClient();
    await client.hset(key, field, value);
  }

  async getValue(key: string, field: string): Promise<string | null> {
    const client = this.redisService.getClient();
    const res = await client.hget(key, field);
    return res;
  }

  async set(key: string, value: any, ttl: number): Promise<void> {
    const client = this.redisService.getClient();
    await client.set(key, value, "EX", ttl);
  }

  async get(key: string): Promise<any> {
    // console.log({ key })
    const client = this.redisService.getClient();
    const value = await client.get(key);
    return value;
  }

  async getString(key: string, database: any = ""): Promise<any> {
    const client = this.redisService.getClient();
    if (database !== "") {
      client.select(database);
    }
    const value = await client.get(key);
    return value;
  }

  async delete(key: string): Promise<void> {
    const client = this.redisService.getClient();
    await client.del(key);
  }

  async setNoExpire(key: string, value: any): Promise<void> {
    const client = this.redisService.getClient();
    await client.set(key, value);
  }

  async hashSet(
    key: string,
    field: string,
    values: any,
    expires = 0,
    database = ""
  ) {
    const client = this.redisService.getClient();
    if (database !== "") {
      client.select(database);
    }
    return new Promise((resolve, reject) => {
      client.hset(key, field, values, (err, reply) => {
        if (err) {
          return reject(err);
        }
        // Add Expire Time if provided
        if (expires !== 0) {
          client.expire(key, expires * 1);
        }
        resolve(reply);
      });
    });
  }
  async hashGet(key: string, field: string, database = "") {
    const client = this.redisService.getClient();
    return new Promise((resolve, reject) => {
      client.hget(key, field, (err, reply) => {
        if (err) {
          return reject(err);
        }
        resolve(reply);
      });
    });
  }
  async getAllHashFields(
    key: string
  ): Promise<{ [key: string]: string } | null> {
    const client = this.redisService.getClient();
    const res = await client.hgetall(key);
    return res;
  }

  async hashRemoved(key: string, field: string, database = "") {
    const client = this.redisService.getClient();
    return new Promise((resolve, reject) => {
      client.hdel(key, field, (err, reply) => {
        if (err) {
          return reject(err);
        }
        resolve(reply);
      });
    });
  }
  async getKeyNameFromValue(hash, targetValue) {
    const client = this.redisService.getClient();
    return new Promise((resolve, reject) => {
      client.hgetall(hash, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        // Iterate through the hash to find the key corresponding to the target value
        for (const [key, value] of Object.entries(result)) {
          if (value === targetValue) {
            resolve(key);
            return;
          }
        }
        // If no matching value is found
        resolve(null);
      });
    });
  }

  // Increment a field value in a hash
  async hashIncrementBy(
    key: string,
    field: string,
    incrementBy: number
  ): Promise<number> {
    const client = this.redisService.getClient();
    return new Promise((resolve, reject) => {
      client.hincrby(key, field, incrementBy, (err, newValue) => {
        if (err) {
          return reject(err);
        }
        resolve(newValue);
      });
    });
  }

  async hashIncrementByNonNegative(
    key: string,
    field: string,
    incrementBy: number
  ): Promise<number> {
    const client = this.redisService.getClient();
    return new Promise((resolve, reject) => {
      client.hincrby(key, field, incrementBy, (err, newValue) => {
        if (err) {
          return reject(err);
        }

        // Ensure the new value is not negative; if negative, reset to zero
        if (newValue < 0) {
          client.hset(key, field, 0, (setErr) => {
            if (setErr) {
              return reject(setErr);
            }
            resolve(0); // Resolve with 0 since we've reset it
          });
        } else {
          resolve(newValue); // Resolve with the updated non-negative value
        }
      });
    });
  }

  async acquireLock(
    userId: string,
    lockKey: string,
    ttl: number
  ): Promise<boolean> {
    const client = this.redisService.getClient();
    const userLockKey = `${lockKey}:${userId}`;
    // Use the correct method signature: (key, value, "EX", ttl, "NX", callback?)
    const result = await client.set(userLockKey, "locked", "EX", ttl, "NX");
    // The result will be "OK" if the lock was acquired, or null if not
    return result === "OK";
  }

  async releaseLock(userId: string, lockKey: string): Promise<void> {
    const client = this.redisService.getClient();
    await client.del(lockKey); // Delete the lock
  }

  async getRemainingLockTime(lockKey: string): Promise<number> {
    const client = this.redisService.getClient();
    const ttl = await client.ttl(lockKey); // Get the remaining time to live in seconds
    return ttl > 0 ? ttl : 0; // Return 0 if the key does not exist or has no TTL
  }

  async getKeyTTLInfo(key: string): Promise<number> {
    try {
      const ttl = await this.redisService.getClient().ttl(key);
      return ttl === -2 || ttl === -1 ? 0 : ttl;
    } catch (error) {
      console.error("Error getting TTL info:", error);
      return 0;
    }
  }

  async removeUserSessionsByUserId(key: string, userId: string) {
    const client = this.redisService.getClient();
    return new Promise((resolve, reject) => {
      client.hkeys(key, (err, fields) => {
        if (err) {
          return reject(err);
        }

        // Find all fields that match `userId:*`
        const fieldsToDelete = fields.filter(field => field.startsWith(`${userId}:`));

        if (fieldsToDelete.length === 0) {
          return resolve(0); // No matching fields found
        }

        client.hdel(key, ...fieldsToDelete, (err, reply) => {
          if (err) {
            return reject(err);
          }
          resolve(reply);
        });
      });
    });
  }

  async hashKeys(key: string): Promise<string[]> {
    const client = this.redisService.getClient();
    return new Promise((resolve, reject) => {
      client.hkeys(key, (err, keys) => {
        if (err) {
          return reject(err);
        }
        resolve(keys);
      });
    });
  }


  async hashDecrementByNonNegative(
    key: string,
    field: string,
    decrementBy: number
  ): Promise<number> {
    const client = this.redisService.getClient();
    return new Promise((resolve, reject) => {
      client.hget(key, field, (err, currentValue) => {
        if (err) return reject(err);

        const current = parseInt(currentValue || "0", 10);
        const newValue = Math.max(current - decrementBy, 0);

        client.hset(key, field, newValue.toString(), (setErr) => {
          if (setErr) return reject(setErr);
          resolve(newValue);
        });
      });
    });
  }



}
