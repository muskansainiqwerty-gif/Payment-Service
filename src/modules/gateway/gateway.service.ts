import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import {
  GatewayChargeRequest,
  GatewayChargeResponse,
} from '../payment/interfaces/gateway-response.interface';
import { CircuitBreakerUtil } from '../../utils/circuit-breaker.util';
import { exponentialBackoffDelay, sleep } from '../../utils/backoff.util';

@Injectable()
export class GatewayService {
  private readonly circuitBreaker = new CircuitBreakerUtil(3, 8000);

  async charge(request: GatewayChargeRequest): Promise<GatewayChargeResponse> {
    if (!this.circuitBreaker.canExecute()) {
      throw new ServiceUnavailableException(
        'Gateway is temporarily unavailable. Please retry shortly.',
      );
    }

    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        const result = this.simulateGatewayCharge(request);
        this.circuitBreaker.onSuccess();
        return result;
      } catch (error) {
        lastError = error as Error;
        this.circuitBreaker.onFailure();
        if (attempt < 3) {
          await sleep(exponentialBackoffDelay(attempt));
        }
      }
    }

    throw new ServiceUnavailableException(
      lastError?.message || 'Payment gateway failed after retries',
    );
  }

  private simulateGatewayCharge(
    request: GatewayChargeRequest,
  ): GatewayChargeResponse {
    const succeed = Math.random() > 0.2;
    if (!succeed) {
      throw new Error('Simulated gateway processing error');
    }
    const timestamp = Date.now();
    return {
      success: true,
      paymentId: `pay_${timestamp}`,
      gatewayOrderId: `order_${request.orderId}`,
      message: 'Payment captured successfully',
      raw: {
        provider: 'razorpay-simulator',
        keyId: process.env.RAZORPAY_KEY_ID || '',
        amount: request.amount,
        currency: request.currency,
      },
    };
  }
}
