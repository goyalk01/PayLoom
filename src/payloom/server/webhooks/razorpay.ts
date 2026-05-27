import { createHmac, timingSafeEqual } from "crypto";

export type RazorpayWebhookEvent = {
  event?: string;
  payload?: Record<string, unknown>;
  created_at?: number;
};

export type RazorpayWebhookResult = {
  eventType: string;
  eventId: string | null;
  payload: RazorpayWebhookEvent;
};

const safeCompare = (left: string, right: string) => {
  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(Buffer.from(left), Buffer.from(right));
};

export const verifyRazorpayWebhookSignature = (params: {
  payload: string;
  signature: string;
  secret: string;
}) => {
  const expected = createHmac("sha256", params.secret)
    .update(params.payload)
    .digest("hex");

  return safeCompare(expected, params.signature);
};

export const parseRazorpayWebhook = (payload: string): RazorpayWebhookResult => {
  const parsed = JSON.parse(payload) as RazorpayWebhookEvent;
  const eventType = parsed.event ?? "unknown";
  const eventId = extractRazorpayEventId(parsed);

  return {
    eventType,
    eventId,
    payload: parsed,
  };
};

export const extractRazorpayEventId = (event: RazorpayWebhookEvent): string | null => {
  const payload = event.payload as Record<string, any> | undefined;
  if (!payload) {
    return null;
  }

  return (
    payload.payment?.entity?.id ??
    payload.order?.entity?.id ??
    payload.refund?.entity?.id ??
    payload?.payment_link?.entity?.id ??
    null
  );
};

export const isRazorpayEventSupported = (eventType: string) => {
  return [
    "payment.authorized",
    "payment.captured",
    "payment.failed",
    "order.paid",
  ].includes(eventType);
};
