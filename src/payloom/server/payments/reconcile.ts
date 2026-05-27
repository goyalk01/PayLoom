import { prisma } from "@/lib/prisma";

export type RazorpayReconcileResult = {
  processed: boolean;
  error?: string;
};

type RazorpayPayload = Record<string, any>;

type RazorpayEntity = {
  id?: string;
  order_id?: string;
  payment_id?: string;
};

const extractIds = (payload: RazorpayPayload) => {
  const paymentEntity = payload?.payment?.entity as RazorpayEntity | undefined;
  const orderEntity = payload?.order?.entity as RazorpayEntity | undefined;

  return {
    providerOrderId: paymentEntity?.order_id ?? orderEntity?.id ?? null,
    providerPaymentId: paymentEntity?.id ?? orderEntity?.payment_id ?? null,
  };
};

export const reconcileRazorpayEvent = async (params: {
  eventType: string;
  payload: RazorpayPayload;
}): Promise<RazorpayReconcileResult> => {
  const { providerOrderId, providerPaymentId } = extractIds(params.payload);

  if (!providerOrderId && !providerPaymentId) {
    return {
      processed: false,
      error: "Unable to resolve provider order/payment identifiers.",
    };
  }

  const orFilters = [] as Array<{ providerOrderId?: string; providerPaymentId?: string }>;
  if (providerOrderId) {
    orFilters.push({ providerOrderId });
  }
  if (providerPaymentId) {
    orFilters.push({ providerPaymentId });
  }

  const payment = await prisma.payment.findFirst({
    where: {
      provider: "RAZORPAY",
      OR: orFilters,
    },
  });

  if (!payment) {
    return {
      processed: false,
      error: "Payment not found for webhook reconciliation.",
    };
  }

  const order = await prisma.order.findUnique({
    where: { id: payment.orderId },
  });

  if (!order) {
    return {
      processed: false,
      error: "Order not found for webhook reconciliation.",
    };
  }

  if (params.eventType === "payment.authorized") {
    if (providerPaymentId && !payment.providerPaymentId) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { providerPaymentId },
      });
    }
    return { processed: true };
  }

  if (params.eventType === "payment.failed") {
    await prisma.$transaction(async (tx) => {
      if (payment.status !== "SUCCESS") {
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: "FAILED",
            providerPaymentId: providerPaymentId ?? payment.providerPaymentId,
          },
        });
      }

      if (payment.status !== "SUCCESS" && order.status !== "PAID") {
        await tx.order.update({
          where: { id: order.id },
          data: { status: "FAILED" },
        });
      }
    });

    return { processed: true };
  }

  if (params.eventType === "payment.captured" || params.eventType === "order.paid") {
    await prisma.$transaction(async (tx) => {
      if (payment.status !== "SUCCESS") {
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: "SUCCESS",
            providerPaymentId: providerPaymentId ?? payment.providerPaymentId,
          },
        });
      }

      if (order.status !== "PAID") {
        await tx.order.update({
          where: { id: order.id },
          data: { status: "PAID" },
        });
      }
    });

    return { processed: true };
  }

  return { processed: true };
};
