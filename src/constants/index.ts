import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

import * as CryptoJS from 'crypto-js';
const crypto = require('crypto');
export const SEQUELIZE = 'SEQUELIZE';
export const DEVELOPMENT = 'dev';
export const STAGE = 'stage';
export const PRODUCTION = 'prod';
export const REFERRAL_POINTS = 500;

export const DEFAULT_RMQ_TIMEOUT = 15 * 1000;
export const TOKEN_REWARD_USD_AMOUNT = 10;
export const REDIS_EXPIRATION_TWO_HOURS = 2 * 60 * 60;
export const DEFAULT_REDIS_LOCK_TTL = 5;
export const LOCK_FOR_POINT_UPDATE = 'lockForPointUpdate';
export interface SubLevel {
  id: string;
  title: string;
  levelNumber: number;
  pointsNeeded: number;
}

export interface Game {
  level: number;
  bearsCount: number;
  bearHitPointsPenalty: number;
  baseLives: number;
  levelBonusLives: number;
  bunchCoins: number;
  coinMultiplier: number;
  coinMultiplierInterval: number;
  coinMultiplierDuration: number;
  gameSubLevel: SubLevel[];
}
export const DEFAULT_TOKEN_DECIMALS = 8;

export const Types = {
  Withdraw: [
    { name: 'user', type: 'address' },
    { name: 'amount', type: 'uint256' },
    { name: 'salt', type: 'bytes32' },
    { name: 'tokenAddress', type: 'address' },
    { name: 'timestamp', type: 'uint256' },
  ],
};

export const TOKEN_CLAIM_LOCK_DURATION_SECONDS = 15 * 60; // 15 minutes in seconds
export const UNIQUE_TOKEN_EXPIRATION_SECONDS = 12 * 60; // 12 minutes in seconds
export const TOKEN_CLAIM_LOCK_KEY = 'tokenClaimLock';
export const EMAIL_QUEUE: string = 'EMAIL_QUEUE';
export const MAX_OTP_CACHE_TIME_30_SEC = 30;

export function MatchPassword(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'matchPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const relatedValue = (args.object as any)[property];
          return (
            typeof value === 'string' &&
            typeof relatedValue === 'string' &&
            value === relatedValue
          );
        },
        defaultMessage(args: ValidationArguments) {
          return `Passwords do not match.`;
        },
      },
    });
  };
}

export function signature(secret, payload) {
  const ts = Math.floor(Date.now() / 1000);
  const body = { ...payload, ts };
  const canonical = JSON.stringify(body, Object.keys(body).sort());
  const sig = crypto
    .createHmac('sha256', secret)
    .update(canonical + ts)
    .digest('hex');

  return { ...body, sig };
}
export const SESSION_KEY = 'userSessions';
