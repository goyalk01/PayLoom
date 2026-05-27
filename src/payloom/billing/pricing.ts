import { validateCoupon } from "@/payloom/billing/coupons";
import { PayloomValidationError } from "@/payloom/core/errors";

export type PricingResult = {
  baseAmount: number;
  discountAmount: number;
  finalAmount: number;
  appliedCoupon: string | null;
};

type PricingInput = {
  baseAmount: number;
  couponCode?: string | null;
};

export const calculateFinalPrice = ({ baseAmount, couponCode }: PricingInput): PricingResult => {
  if (!Number.isInteger(baseAmount) || baseAmount <= 0) {
    throw new PayloomValidationError("Base amount must be a positive integer in smallest currency unit.");
  }

  const couponResult = validateCoupon(couponCode);
  if (!couponResult.valid) {
    throw new PayloomValidationError(couponResult.message);
  }

  const discountAmount = Math.min(couponResult.discountAmount, baseAmount);
  const finalAmount = baseAmount - discountAmount;

  return {
    baseAmount,
    discountAmount,
    finalAmount,
    appliedCoupon: couponResult.appliedCoupon,
  };
};
