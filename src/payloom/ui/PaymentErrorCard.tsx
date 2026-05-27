"use client";

type PaymentErrorCardProps = {
  message: string;
};

export function PaymentErrorCard({ message }: PaymentErrorCardProps) {
  return (
    <div className="rounded-2xl border border-rose-400/50 bg-rose-400/10 px-4 py-4 text-sm text-rose-200">
      <p className="text-base font-semibold">Payment failed</p>
      <p className="mt-1 text-xs text-rose-200">{message}</p>
    </div>
  );
}
