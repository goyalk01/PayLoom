export type CreateOrderParams = {
  userId: string;
  productName: string;
  baseAmount: number;
  currency?: "INR" | "USD" | "EUR";
  metadata?: Record<string, unknown>;
  couponCode?: string | null;
};

export type CreateOrderResult = {
  internalOrderId: string;
  providerOrderId: string;
  amount: number;
  currency: string;
  provider: "razorpay" | "stripe" | "paypal";
};

export type VerifyPaymentParams = {
  internalOrderId: string;
  providerOrderId: string;
  providerPaymentId: string;
  signature: string;
};

export type VerifyPaymentResult = {
  verified: boolean;
  paymentId?: string;
  orderId?: string;
  message: string;
};

export interface PaymentProviderAdapter {
  createOrder(params: CreateOrderParams): Promise<CreateOrderResult>;
  verifyPayment(params: VerifyPaymentParams): Promise<VerifyPaymentResult>;
}
