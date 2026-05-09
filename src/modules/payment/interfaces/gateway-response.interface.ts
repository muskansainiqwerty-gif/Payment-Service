export interface GatewayChargeRequest {
  orderId: string;
  amount: number;
  currency: string;
  description?: string;
}

export interface GatewayChargeResponse {
  success: boolean;
  paymentId?: string;
  gatewayOrderId?: string;
  message: string;
  raw: Record<string, any>;
}
