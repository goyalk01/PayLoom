export type CouponValidationResult = {
  valid: boolean;
  appliedCoupon: string | null;
  discountAmount: number;
  message: string;
};

export const validateCoupon = (code?: string | null): CouponValidationResult => {
  if (!code) {
    return {
      valid: true,
      appliedCoupon: null,
      discountAmount: 0,
      message: "No coupon applied",
    };
  }

  const normalized = code.trim().toUpperCase();
  if (!normalized) {
    return {
      valid: true,
      appliedCoupon: null,
      discountAmount: 0,
      message: "No coupon applied",
    };
  }

  if (normalized === "SAVE20") {
    return {
      valid: true,
      appliedCoupon: normalized,
      discountAmount: 2000,
      message: "Coupon SAVE20 applied",
    };
  }

  return {
    valid: false,
    appliedCoupon: null,
    discountAmount: 0,
    message: "Invalid coupon code",
  };
};
