"use client";

import { CheckoutButton } from "@/payloom/ui/CheckoutButton";

export type PricingCardProps = {
  title: string;
  price: string;
  description: string;
  features: string[];
  ctaLabel: string;
  amount: number;
  product: string;
  userId: string;
  highlight?: boolean;
  couponCode?: string | null;
  currency?: "INR" | "USD" | "EUR";
  metadata?: Record<string, unknown>;
};

export function PricingCard({
  title,
  price,
  description,
  features,
  ctaLabel,
  amount,
  product,
  userId,
  highlight = false,
  couponCode,
  currency,
  metadata,
}: PricingCardProps) {
  return (
    <div
      className={`flex h-full flex-col rounded-3xl border px-6 py-6 text-left transition ${
        highlight
          ? "border-emerald-400/70 bg-emerald-400/10"
          : "border-slate-800 bg-slate-900/60"
      }`}
    >
      <div className="flex-1 space-y-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
            {title}
          </p>
          <p className="mt-2 text-3xl font-semibold text-white">{price}</p>
        </div>
        <p className="text-sm text-slate-300">{description}</p>
        <ul className="mt-4 space-y-2 text-sm text-slate-300">
          {features.map((feature) => (
            <li key={feature} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6">
        <CheckoutButton
          amount={amount}
          product={product}
          userId={userId}
          couponCode={couponCode}
          currency={currency}
          metadata={metadata}
        >
          {ctaLabel}
        </CheckoutButton>
      </div>
    </div>
  );
}
