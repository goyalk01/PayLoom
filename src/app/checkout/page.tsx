"use client";

import { useMemo, useState } from "react";

import { CheckoutButton } from "@/payloom/ui/CheckoutButton";
import { PricingCard } from "@/payloom/ui/PricingCard";

export default function CheckoutPage() {
  const [userId, setUserId] = useState("");
  const [amount, setAmount] = useState("49900");
  const [couponCode, setCouponCode] = useState("");

  const parsedAmount = useMemo(() => Number(amount), [amount]);
  const amountValue = Number.isFinite(parsedAmount) ? parsedAmount : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-16">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
            Reusable Checkout Demo
          </p>
          <h1 className="text-3xl font-semibold">Payloom Checkout DX</h1>
          <p className="text-sm text-slate-300">
            All amounts use the smallest currency unit (paise). Configure test keys only.
          </p>
        </header>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="flex flex-col gap-2 text-sm">
              User ID
              <input
                className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                value={userId}
                onChange={(event) => setUserId(event.target.value)}
                placeholder="user_123"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              Amount (paise)
              <input
                className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="49900"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              Coupon (optional)
              <input
                className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                value={couponCode}
                onChange={(event) => setCouponCode(event.target.value)}
                placeholder="SAVE20"
              />
            </label>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <CheckoutButton
              amount={amountValue}
              product="Custom Payloom Order"
              userId={userId}
              couponCode={couponCode || null}
            >
              Pay with Razorpay
            </CheckoutButton>
            <span className="text-xs text-slate-400">
              Powered by Payloom billing engine
            </span>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <PricingCard
            title="Starter"
            price="Rs 499"
            description="Perfect for testing and internal pilots."
            features={["1 project", "Basic support", "Starter analytics"]}
            ctaLabel="Start now"
            amount={49900}
            product="Starter Plan"
            userId={userId}
          />
          <PricingCard
            title="Pro"
            price="Rs 999"
            description="For serious builders shipping paid products."
            features={["Unlimited projects", "Priority support", "Advanced exports"]}
            ctaLabel="Upgrade now"
            amount={99900}
            product="Pro Plan"
            userId={userId}
            highlight
          />
        </section>
      </main>
    </div>
  );
}
