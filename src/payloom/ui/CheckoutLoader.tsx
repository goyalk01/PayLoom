"use client";

type CheckoutLoaderProps = {
  label: string;
};

export function CheckoutLoader({ label }: CheckoutLoaderProps) {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-300">
      <span className="flex h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
      <span>{label}</span>
    </div>
  );
}
