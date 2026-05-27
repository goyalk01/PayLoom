"use client";

import { Button } from "@/components/ui/button";
import { useCheckout } from "@/payloom/hooks/useCheckout";
import { CheckoutModal } from "@/payloom/ui/CheckoutModal";

export type CheckoutButtonProps = {
  amount: number;
  product: string;
  userId: string;
  couponCode?: string | null;
  currency?: "INR" | "USD" | "EUR";
  metadata?: Record<string, unknown>;
  onSuccess?: () => void;
  onError?: (message: string) => void;
  children?: React.ReactNode;
};

export function CheckoutButton({
  amount,
  product,
  userId,
  couponCode,
  currency,
  metadata,
  onSuccess,
  onError,
  children,
}: CheckoutButtonProps) {
  const {
    openCheckout,
    closeCheckout,
    resetCheckout,
    retryCheckout,
    isOpen,
    isLoading,
    isBusy,
    error,
    paymentData,
    requestData,
    phase,
    statusMessage,
    statusTone,
  } = useCheckout();

  const handleCheckout = () => {
    void openCheckout(
      {
        userId,
        productName: product,
        baseAmount: amount,
        currency,
        couponCode,
        metadata,
      },
      {
        onSuccess: () => onSuccess?.(),
        onError: (message) => onError?.(message),
      }
    );
  };

  const handleClose = () => {
    closeCheckout();
  };

  const handleRetry = () => {
    retryCheckout({
      onSuccess: () => onSuccess?.(),
      onError: (message) => onError?.(message),
    });
  };

  return (
    <>
      <Button onClick={handleCheckout} disabled={isBusy}>
        {children ?? (isBusy ? "Processing..." : "Pay with Payloom")}
      </Button>
      <CheckoutModal
        isOpen={isOpen}
        productName={requestData?.product ?? product}
        amount={paymentData?.amount ?? requestData?.amount ?? amount}
        currency={paymentData?.currency ?? requestData?.currency ?? currency ?? "INR"}
        phase={phase}
        statusMessage={error ?? statusMessage}
        statusTone={statusTone}
        paymentData={paymentData}
        isLoading={isLoading}
        onClose={handleClose}
        onRetry={phase === "failed" ? handleRetry : undefined}
        onReset={resetCheckout}
      />
    </>
  );
}
