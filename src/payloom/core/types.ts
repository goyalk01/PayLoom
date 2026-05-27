export type SupportedPaymentProvider = "razorpay" | "stripe" | "paypal";
export type CurrencyCode = "INR" | "USD" | "EUR";
export type PayloomEnvironment = "development" | "test" | "production";

export interface PayloomConfig {
  appUrl: string;
  environment: PayloomEnvironment;
  defaultCurrency: CurrencyCode;
  paymentProvider: SupportedPaymentProvider;
}

export interface OrderAmountBreakdown {
  baseAmount: number;
  discountAmount: number;
  finalAmount: number;
  currency: CurrencyCode;
}

export interface BaseOrderInput {
  userId: string;
  productName: string;
  baseAmount: number;
  currency?: CurrencyCode;
  metadata?: Record<string, unknown>;
  couponCode?: string;
}

export interface HealthCheckResponse {
  ok: boolean;
  app: string;
  database: string;
  provider: SupportedPaymentProvider;
  environment: PayloomEnvironment;
  timestamp: string;
}
