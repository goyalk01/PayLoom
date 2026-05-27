import { createHmac } from "crypto";
import Razorpay from "razorpay";

import { prisma } from "@/lib/prisma";
import { calculateFinalPrice } from "@/payloom/billing/pricing";
import type {
  CreateOrderParams,
  CreateOrderResult,
  PaymentProviderAdapter,
  VerifyPaymentParams,
  VerifyPaymentResult,
} from "@/payloom/core/contracts";
import { payloomConfig } from "@/payloom/core/config";
import {
  PayloomConfigError,
  PayloomValidationError,
  PayloomVerificationError,
} from "@/payloom/core/errors";

const getRazorpayClient = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new PayloomConfigError("Missing Razorpay server keys.");
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

const assertRazorpayCurrency = (currency: string) => {
  if (currency !== "INR") {
    throw new PayloomValidationError("Razorpay integration currently supports INR only.");
  }
};

export class RazorpayAdapter implements PaymentProviderAdapter {
  async createOrder(params: CreateOrderParams): Promise<CreateOrderResult> {
    const currency = (params.currency ?? payloomConfig.defaultCurrency).toUpperCase();
    assertRazorpayCurrency(currency);

    const pricing = calculateFinalPrice({
      baseAmount: params.baseAmount,
      couponCode: params.couponCode ?? null,
    });

    const internalOrder = await prisma.order.create({
      data: {
        userId: params.userId,
        productName: params.productName,
        baseAmount: pricing.baseAmount,
        discountAmount: pricing.discountAmount,
        finalAmount: pricing.finalAmount,
        currency,
        status: "PENDING",
        provider: "RAZORPAY",
        couponCode: pricing.appliedCoupon,
        metadata: params.metadata ?? undefined,
      },
    });

    const razorpay = getRazorpayClient();
    const providerOrder = await razorpay.orders.create({
      amount: pricing.finalAmount,
      currency,
      receipt: internalOrder.id,
      notes: {
        internalOrderId: internalOrder.id,
        productName: params.productName,
      },
    });

    await prisma.payment.create({
      data: {
        orderId: internalOrder.id,
        providerOrderId: providerOrder.id,
        amount: pricing.finalAmount,
        currency,
        status: "PENDING",
        provider: "RAZORPAY",
        rawPayload: providerOrder,
      },
    });

    return {
      internalOrderId: internalOrder.id,
      providerOrderId: providerOrder.id,
      amount: pricing.finalAmount,
      currency,
      provider: "razorpay",
    };
  }

  async verifyPayment(params: VerifyPaymentParams): Promise<VerifyPaymentResult> {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      throw new PayloomConfigError("Missing Razorpay signature secret.");
    }

    const internalOrder = await prisma.order.findUnique({
      where: { id: params.internalOrderId },
    });

    if (!internalOrder) {
      throw new PayloomVerificationError("Order not found for verification.");
    }

    const expectedSignature = createHmac("sha256", keySecret)
      .update(`${params.providerOrderId}|${params.providerPaymentId}`)
      .digest("hex");

    const isVerified = expectedSignature === params.signature;

    if (!isVerified) {
      await prisma.payment.updateMany({
        where: {
          orderId: params.internalOrderId,
          providerOrderId: params.providerOrderId,
        },
        data: {
          providerPaymentId: params.providerPaymentId,
          signature: params.signature,
          status: "FAILED",
        },
      });

      await prisma.order.update({
        where: { id: params.internalOrderId },
        data: { status: "FAILED" },
      });

      return {
        verified: false,
        message: "Signature verification failed.",
      };
    }

    await prisma.payment.updateMany({
      where: {
        orderId: params.internalOrderId,
        providerOrderId: params.providerOrderId,
      },
      data: {
        providerPaymentId: params.providerPaymentId,
        signature: params.signature,
        status: "SUCCESS",
      },
    });

    await prisma.order.update({
      where: { id: params.internalOrderId },
      data: { status: "PAID" },
    });

    return {
      verified: true,
      paymentId: params.providerPaymentId,
      orderId: params.providerOrderId,
      message: "Payment verified successfully.",
    };
  }
}
