## Mad Bus Backend (NestJS)

Backend service built with NestJS, Sequelize (MySQL), Redis, and RabbitMQ.

The current implementation includes a complete payment processing flow with:

- asynchronous queue-based processing
- idempotency handling
- webhook signature validation
- retry and resilience patterns
- Swagger and Postman-ready testing support

## Version

`0.0.1`

## Tech Stack

- NestJS
- Sequelize + MySQL
- Redis
- RabbitMQ (`amqplib`)
- Swagger (`@nestjs/swagger`)
- Class Validator / Class Transformer

## Project Setup

```bash
npm install
```

## Run

```bash
# normal
npm run start

# watch
npm run start:dev

# debug
npm run start:debug

# stage
npm run start:stage

# prod
npm run start:prod
```

## Test Commands

```bash
npm run test
npm run test:e2e
npm run test:cov
```

## Environment Requirements

Minimum required values in `.env`:

- `PORT=3002`
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME_DEVELOPMENT`
- `REDIS_URL`
- `RABBIT_MQ=amqp://guest:guest@localhost`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
- `ENABLE_SWAGGER=true` (to enable docs)

## API Base URLs

- Base API: `http://localhost:3002/game/api/v1`
- Swagger: `http://localhost:3002/api` (when `ENABLE_SWAGGER=true`)

## Payment Module Overview

### Endpoints

- `POST /game/api/v1/payments`

  - Creates payment in `PENDING`
  - Accepts `x-idempotency-key` (optional)
  - Publishes job to RabbitMQ

- `GET /game/api/v1/payments/:id`

  - Fetches payment by ID

- `GET /game/api/v1/payments?page=1&limit=10`

  - Fetches paginated payments

- `POST /game/api/v1/webhook/payment`
  - Processes signed webhook payload
  - Header required: `x-razorpay-signature`

### State Flow

`PENDING -> PROCESSING -> SUCCESS`

or

`PENDING -> PROCESSING -> (retry) -> FAILED`

Webhook can also update status to `SUCCESS` or `FAILED`.

## Queue and Retry Design

- Producer publishes payment jobs to RabbitMQ queue
- Worker consumes from main queue
- On failure, message is routed to retry queue with delay and retry count
- After max retries, payment is marked `FAILED`

Queue constants are defined in:

- `src/modules/payment/constants/payment.constants.ts`

## Idempotency Design

Idempotency is handled using:

1. `payments.idempotencyKey` for replay of same request
2. `payment_idempotency_records` table for request hash and response mapping
3. Redis key cache for quick idempotency key lookup metadata

If same idempotency key is reused with a different payload, API returns `400`.

## Security and Validation

- Webhook HMAC signature validation using `RAZORPAY_WEBHOOK_SECRET`
- Request DTO validation with `class-validator`
- Global exception filters and standardized response shape:
  - `{ error, message, data, status }`

## Postman Collection

Import:

- `postman/mad-bus-payment-testing.postman_collection.json`

This collection includes:

- create payment
- fetch payment by id
- list payments
- signed webhook calls

## Notes

- Database sync is enabled at startup using Sequelize sync with alter.
- For production environments, prefer migrations and controlled schema rollout.
