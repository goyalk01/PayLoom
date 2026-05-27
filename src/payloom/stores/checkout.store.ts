import { create } from "zustand";

export type CheckoutPhase =
  | "idle"
  | "creating_order"
  | "checkout_open"
  | "verifying"
  | "success"
  | "failed"
  | "dismissed";

export type CheckoutSessionPayload = {
  userId: string;
  product: string;
  amount: number;
  currency?: string | null;
  couponCode?: string | null;
};

export type CheckoutStoreState = {
  sessionId: string | null;
  isOpen: boolean;
  phase: CheckoutPhase;
  error: string | null;
  userId: string | null;
  product: string | null;
  amount: number | null;
  currency: string | null;
  couponCode: string | null;
  orderId: string | null;
  providerOrderId: string | null;
  paymentId: string | null;
  signature: string | null;
  lastUpdatedAt: number | null;
  openSession: (payload: CheckoutSessionPayload) => void;
  setCreatingOrder: () => void;
  setCheckoutOpen: (data: {
    orderId: string;
    providerOrderId: string;
    amount?: number | null;
    currency?: string | null;
  }) => void;
  setVerifying: (data: {
    paymentId: string;
    signature: string;
    providerOrderId?: string | null;
    orderId?: string | null;
  }) => void;
  setSuccess: (data: {
    paymentId: string;
    signature: string;
    providerOrderId?: string | null;
    orderId?: string | null;
  }) => void;
  setFailed: (message: string) => void;
  setDismissed: () => void;
  closeModal: () => void;
  resetSession: () => void;
};

const now = () => Date.now();
const createSessionId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
};

const initialState = {
  sessionId: null,
  isOpen: false,
  phase: "idle" as CheckoutPhase,
  error: null,
  userId: null,
  product: null,
  amount: null,
  currency: null,
  couponCode: null,
  orderId: null,
  providerOrderId: null,
  paymentId: null,
  signature: null,
  lastUpdatedAt: null,
};

export const useCheckoutStore = create<CheckoutStoreState>((set) => ({
  ...initialState,
  openSession: (payload) =>
    set(() => ({
      ...initialState,
      sessionId: createSessionId(),
      isOpen: true,
      userId: payload.userId,
      product: payload.product,
      amount: payload.amount,
      currency: payload.currency ?? null,
      couponCode: payload.couponCode ?? null,
      lastUpdatedAt: now(),
    })),
  setCreatingOrder: () =>
    set((state) => ({
      ...state,
      phase: "creating_order",
      error: null,
      lastUpdatedAt: now(),
    })),
  setCheckoutOpen: (data) =>
    set((state) => ({
      ...state,
      phase: "checkout_open",
      orderId: data.orderId ?? state.orderId,
      providerOrderId: data.providerOrderId ?? state.providerOrderId,
      amount: data.amount ?? state.amount,
      currency: data.currency ?? state.currency,
      error: null,
      lastUpdatedAt: now(),
    })),
  setVerifying: (data) =>
    set((state) => ({
      ...state,
      phase: "verifying",
      paymentId: data.paymentId ?? state.paymentId,
      signature: data.signature ?? state.signature,
      providerOrderId: data.providerOrderId ?? state.providerOrderId,
      orderId: data.orderId ?? state.orderId,
      error: null,
      lastUpdatedAt: now(),
    })),
  setSuccess: (data) =>
    set((state) => ({
      ...state,
      phase: "success",
      paymentId: data.paymentId ?? state.paymentId,
      signature: data.signature ?? state.signature,
      providerOrderId: data.providerOrderId ?? state.providerOrderId,
      orderId: data.orderId ?? state.orderId,
      error: null,
      lastUpdatedAt: now(),
    })),
  setFailed: (message) =>
    set((state) => ({
      ...state,
      phase: "failed",
      error: message,
      lastUpdatedAt: now(),
    })),
  setDismissed: () =>
    set((state) => ({
      ...state,
      phase: "dismissed",
      error: null,
      lastUpdatedAt: now(),
    })),
  closeModal: () =>
    set((state) => ({
      ...state,
      isOpen: false,
      lastUpdatedAt: now(),
    })),
  resetSession: () =>
    set(() => ({
      ...initialState,
      sessionId: createSessionId(),
      lastUpdatedAt: now(),
    })),
}));
