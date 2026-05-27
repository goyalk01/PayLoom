"use client";

type PaymentSuccessCardProps = {
  orderId?: string | null;
  providerOrderId?: string | null;
  paymentId?: string | null;
};

export function PaymentSuccessCard({
  orderId,
  providerOrderId,
  paymentId,
}: PaymentSuccessCardProps) {
  return (
    <div className="rounded-2xl border border-emerald-400/40 bg-emerald-400/10 px-4 py-4 text-sm text-emerald-100">
      <p className="text-base font-semibold">Payment successful</p>
      <p className="mt-1 text-xs text-emerald-200">
        Your payment has been verified and stored.
      </p>
      <div className="mt-4 space-y-2 text-xs text-emerald-100">
        <div className="flex items-center justify-between gap-4">
          <span className="text-emerald-200">Order ID</span>
          <span className="truncate text-right">{orderId ?? "--"}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-emerald-200">Provider Order</span>
          <span className="truncate text-right">{providerOrderId ?? "--"}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-emerald-200">Payment ID</span>
          <span className="truncate text-right">{paymentId ?? "--"}</span>
        </div>
      </div>
    </div>
  );
}
