import { z } from "zod";

import { PayloomConfigError } from "@/payloom/core/errors";
import type { PayloomConfig } from "@/payloom/core/types";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  PAYLOOM_ENV: z.enum(["development", "test", "production"]),
  DEFAULT_CURRENCY: z.enum(["INR", "USD", "EUR"]),
  PAYMENT_PROVIDER: z.enum(["razorpay", "stripe", "paypal"]),
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().optional(),
});

const parsedEnv = envSchema.safeParse({
  DATABASE_URL: process.env.DATABASE_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  PAYLOOM_ENV: process.env.PAYLOOM_ENV,
  DEFAULT_CURRENCY: process.env.DEFAULT_CURRENCY,
  PAYMENT_PROVIDER: process.env.PAYMENT_PROVIDER,
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
  NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
});

if (!parsedEnv.success) {
  console.error("Invalid Payloom environment configuration", parsedEnv.error.flatten().fieldErrors);
  throw new PayloomConfigError("Invalid Payloom environment configuration");
}

if (parsedEnv.data.PAYMENT_PROVIDER === "razorpay") {
  const missingKeys = [
    !parsedEnv.data.RAZORPAY_KEY_ID && "RAZORPAY_KEY_ID",
    !parsedEnv.data.RAZORPAY_KEY_SECRET && "RAZORPAY_KEY_SECRET",
    !parsedEnv.data.NEXT_PUBLIC_RAZORPAY_KEY_ID && "NEXT_PUBLIC_RAZORPAY_KEY_ID",
  ].filter(Boolean) as string[];

  if (missingKeys.length > 0) {
    throw new PayloomConfigError(
      `Missing Razorpay configuration: ${missingKeys.join(", ")}`
    );
  }
}

export const payloomConfig: PayloomConfig = {
  appUrl: parsedEnv.data.NEXT_PUBLIC_APP_URL,
  environment: parsedEnv.data.PAYLOOM_ENV,
  defaultCurrency: parsedEnv.data.DEFAULT_CURRENCY,
  paymentProvider: parsedEnv.data.PAYMENT_PROVIDER,
};
