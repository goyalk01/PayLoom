"use client";

import { Button } from "@/components/ui/button";
import type { CheckoutPaymentData } from "@/payloom/hooks/useCheckout";
import type { CheckoutPhase } from "@/payloom/stores/checkout.store";
import { CheckoutLoader } from "@/payloom/ui/CheckoutLoader";
import { PaymentErrorCard } from "@/payloom/ui/PaymentErrorCard";
import { PaymentStatus } from "@/payloom/ui/PaymentStatus";
import { PaymentSuccessCard } from "@/payloom/ui/PaymentSuccessCard";

type CheckoutModalProps = {
  isOpen: boolean;
  productName?: string | null;
  amount?: number | null;
  currency?: string;
  phase: CheckoutPhase;
  statusMessage: string;
  statusTone: "info" | "success" | "error";
  paymentData?: CheckoutPaymentData | null;
  isLoading: boolean;
  onClose: () => void;
  onRetry?: () => void;
  onReset?: () => void;
};

const formatAmount = (amount?: number | null, currency?: string) => {
  if (amount === null || amount === undefined || !currency) {
    return "--";
  }

  const majorAmount = amount / 100;

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(majorAmount);
  } catch {
    return `${majorAmount.toFixed(2)} ${currency}`;
  }
};

export function CheckoutModal({
  isOpen,
  productName,
  amount,
  currency,
  phase,
  statusMessage,
  statusTone,
  paymentData,
  isLoading,
  onClose,
  onRetry,
  onReset,
}: CheckoutModalProps) {
  if (!isOpen) {
    return null;
  }

  const showRetry = phase === "failed" && Boolean(onRetry);
  const showReset = (phase === "success" || phase === "dismissed") && Boolean(onReset);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-8">
      <div
        className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 text-slate-100 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-label="Checkout status"
      >
        <div className="flex items-start justify-between border-b border-slate-800 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
              Payloom Checkout
            </p>
            <h2 className="mt-2 text-xl font-semibold">Payment status</h2>
          </div>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="space-y-5 px-6 py-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Summary</p>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Product</span>
                <span className="font-medium text-slate-100">
                  {productName || "--"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Amount</span>
                <span className="font-medium text-slate-100">
                  {formatAmount(amount, currency)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Order ID</span>
                <span className="truncate text-right text-xs text-slate-300">
                  {paymentData?.internalOrderId ?? "--"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Provider Order</span>
                <span className="truncate text-right text-xs text-slate-300">
                  {paymentData?.providerOrderId ?? "--"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Payment ID</span>
                <span className="truncate text-right text-xs text-slate-300">
                  {paymentData?.paymentId ?? "--"}
                </span>
              </div>
            </div>
          </div>

          {phase === "creating_order" ? (
            <CheckoutLoader label="Creating your order..." />
          ) : null}
          {phase === "checkout_open" ? (
            <PaymentStatus
              title="Checkout opened"
              message="Complete the payment in Razorpay."
              tone="info"
            />
          ) : null}
          {phase === "verifying" ? (
            <CheckoutLoader label="Verifying payment..." />
          ) : null}
          {phase === "success" ? (
            <PaymentSuccessCard
              orderId={paymentData?.internalOrderId}
              providerOrderId={paymentData?.providerOrderId}
              paymentId={paymentData?.paymentId}
            />
          ) : null}
          {phase === "failed" ? (
            <PaymentErrorCard message={statusMessage} />
          ) : null}
          {phase === "dismissed" ? (
            <PaymentStatus
              title="Checkout closed"
              message="Checkout closed by user."
              tone="info"
            />
          ) : null}
          {phase === "idle" ? (
            <PaymentStatus title="Ready" message={statusMessage} tone={statusTone} />
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-400">
              {isLoading
                ? "Processing payment..."
                : "You can close this dialog anytime."}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {showRetry ? <Button onClick={onRetry}>Try again</Button> : null}
              {showReset ? (
                <Button variant="secondary" onClick={onReset}>
                  Reset
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
