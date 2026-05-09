export const PAYMENT_LOCK_PREFIX = 'payment:lock';
export const IDEMPOTENCY_KEY_PREFIX = 'payment:idempotency';

export const IDEMPOTENCY_TTL_SECONDS = 60 * 60;
export const PAYMENT_QUEUE_NAME = 'payment-processing-queue';
export const PAYMENT_RETRY_QUEUE_NAME = 'payment-processing-retry-queue';
export const PAYMENT_MAX_RETRIES = 3;
export const PAYMENT_RETRY_DELAY_MS = 3000;

export const RAZORPAY_HEADERS = {
  SIGNATURE: 'x-razorpay-signature',
};
