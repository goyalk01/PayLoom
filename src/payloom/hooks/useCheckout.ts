"use client";

import { useCallback, useMemo, useRef } from "react";

import {
  type CheckoutSessionPayload,
  useCheckoutStore,
} from "@/payloom/stores/checkout.store";

export type CheckoutRequest = {
  userId: string;
  productName: string;
  baseAmount: number;
  currency?: "INR" | "USD" | "EUR";
  couponCode?: string | null;
  metadata?: Record<string, unknown>;
};

export type CheckoutPaymentData = {
  internalOrderId: string | null;
  providerOrderId: string | null;
  paymentId: string | null;
  signature: string | null;
  amount: number | null;
  currency: string | null;
};

type CheckoutHandlers = {
  onSuccess?: (data: CheckoutPaymentData) => void;
  onError?: (message: string) => void;
};

type CreateOrderResponse = {
  internalOrderId: string;
  providerOrderId: string;
  amount: number;
  currency: string;
  error?: string;
};

type VerifyResponse = {
  message?: string;
  error?: string;
  verified?: boolean;
};

const loadRazorpayScript = () => {
  return new Promise<boolean>((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    if (document.querySelector("script[data-razorpay]")) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.dataset.razorpay = "true";

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
};

const toErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return fallback;
};

export const useCheckout = () => {
  const {
    sessionId,
    isOpen,
    phase,
    error,
    userId,
    product,
    amount,
    currency,
    couponCode,
    orderId,
    providerOrderId,
    paymentId,
    signature,
    openSession,
    setCreatingOrder,
    setCheckoutOpen,
    setVerifying,
    setSuccess,
    setFailed,
    setDismissed,
    closeModal,
    resetSession,
  } = useCheckoutStore();

  const lastRequestRef = useRef<CheckoutRequest | null>(null);

  const resetCheckout = useCallback(() => {
    resetSession();
    lastRequestRef.current = null;
  }, [resetSession]);

  const closeCheckout = useCallback(() => {
    closeModal();
  }, [closeModal]);

  const openCheckout = useCallback(
    async (request: CheckoutRequest, handlers?: CheckoutHandlers) => {
      lastRequestRef.current = request;
      const sessionPayload: CheckoutSessionPayload = {
        userId: request.userId,
        product: request.productName,
        amount: request.baseAmount,
        currency: request.currency ?? null,
        couponCode: request.couponCode ?? null,
      };

      openSession(sessionPayload);
      setCreatingOrder();

      try {
        const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
        if (!keyId) {
          throw new Error("Missing Razorpay public key.");
        }

        if (!request.userId.trim() || !request.productName.trim()) {
          throw new Error("User ID and product name are required.");
        }

        if (!Number.isInteger(request.baseAmount) || request.baseAmount <= 0) {
          throw new Error("Amount must be a positive integer in smallest currency unit.");
        }

        const orderResponse = await fetch("/api/payments/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: request.userId.trim(),
            productName: request.productName.trim(),
            baseAmount: request.baseAmount,
            currency: request.currency,
            couponCode: request.couponCode ?? null,
            metadata: request.metadata ?? {},
          }),
        });

        const orderData = (await orderResponse.json()) as CreateOrderResponse;

        if (!orderResponse.ok) {
          throw new Error(orderData.error ?? "Failed to create order.");
        }

        setCheckoutOpen({
          orderId: orderData.internalOrderId,
          providerOrderId: orderData.providerOrderId,
          amount: orderData.amount,
          currency: orderData.currency,
        });

        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          throw new Error("Failed to load Razorpay SDK.");
        }

        const RazorpayCtor = (window as Window & { Razorpay?: any }).Razorpay;
        if (!RazorpayCtor) {
          throw new Error("Razorpay SDK not available.");
        }

        const razorpay = new RazorpayCtor({
          key: keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "Payloom",
          description: request.productName,
          order_id: orderData.providerOrderId,
          handler: async (response: {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          }) => {
            setVerifying({
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              providerOrderId: response.razorpay_order_id,
              orderId: orderData.internalOrderId,
            });

            const verifyResponse = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                internalOrderId: orderData.internalOrderId,
                providerOrderId: response.razorpay_order_id,
                providerPaymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              }),
            });

            const verifyData = (await verifyResponse.json()) as VerifyResponse;

            if (!verifyResponse.ok || verifyData.verified === false) {
              const message =
                verifyData.error ?? verifyData.message ?? "Verification failed.";
              setFailed(message);
              handlers?.onError?.(message);
              return;
            }

            setSuccess({
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              providerOrderId: response.razorpay_order_id,
              orderId: orderData.internalOrderId,
            });

            handlers?.onSuccess?.({
              internalOrderId: orderData.internalOrderId,
              providerOrderId: orderData.providerOrderId,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              amount: orderData.amount,
              currency: orderData.currency,
            });
          },
          modal: {
            ondismiss: () => {
              setDismissed();
            },
          },
        });

        razorpay.open();
      } catch (caught) {
        const message = toErrorMessage(caught, "Checkout failed.");
        setFailed(message);
        handlers?.onError?.(message);
      }
    },
    [
      openSession,
      setCreatingOrder,
      setCheckoutOpen,
      setDismissed,
      setFailed,
      setSuccess,
      setVerifying,
    ]
  );

  const retryCheckout = useCallback(
    (handlers?: CheckoutHandlers) => {
      if (lastRequestRef.current) {
        void openCheckout(lastRequestRef.current, handlers);
      }
    },
    [openCheckout]
  );

  const statusMessage = useMemo(() => {
    if (phase === "creating_order") {
      return "Creating your order...";
    }

    if (phase === "checkout_open") {
      return "Checkout opened";
    }

    if (phase === "verifying") {
      return "Verifying payment...";
    }

    if (phase === "success") {
      return "Payment successful";
    }

    if (phase === "dismissed") {
      return "Checkout closed by user";
    }

    if (phase === "failed") {
      return error ?? "Payment failed";
    }

    return "Ready to checkout.";
  }, [error, phase]);

  const statusTone = useMemo<"info" | "error" | "success">(() => {
  if (phase === "failed") {
    return "error";
  }

  if (phase === "success") {
    return "success";
  }

  return "info";
}, [phase]);

  const isLoading = phase === "creating_order" || phase === "verifying";
  const isBusy = isLoading || phase === "checkout_open";

  const paymentData: CheckoutPaymentData = {
    internalOrderId: orderId,
    providerOrderId,
    paymentId,
    signature,
    amount,
    currency,
  };

  return {
    openCheckout,
    closeCheckout,
    resetCheckout,
    retryCheckout,
    sessionId,
    isOpen,
    isLoading,
    isBusy,
    error,
    phase,
    statusMessage,
    statusTone,
    paymentData,
    requestData: {
      userId,
      product,
      amount,
      currency,
      couponCode,
    },
  };
};
