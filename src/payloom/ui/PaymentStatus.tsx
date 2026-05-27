"use client";

type PaymentStatusProps = {
  title: string;
  message: string;
  tone: "info" | "success" | "error";
};

export function PaymentStatus({ title, message, tone }: PaymentStatusProps) {
  const toneStyles =
    tone === "success"
      ? "border-emerald-400/60 text-emerald-200"
      : tone === "error"
        ? "border-rose-400/60 text-rose-200"
        : "border-slate-700 text-slate-300";

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm ${toneStyles}`}>
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-xs text-current">{message}</p>
    </div>
  );
}
