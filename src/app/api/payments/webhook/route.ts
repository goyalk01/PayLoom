import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  isRazorpayEventSupported,
  parseRazorpayWebhook,
  verifyRazorpayWebhookSignature,
} from "@/payloom/server/webhooks/razorpay";
import { reconcileRazorpayEvent } from "@/payloom/server/payments/reconcile";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";
  const eventIdHeader = request.headers.get("x-razorpay-event-id");
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET ?? "";

  if (!secret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  if (!signature) {
    return NextResponse.json({ error: "Missing webhook signature" }, { status: 400 });
  }

  const isValid = verifyRazorpayWebhookSignature({
    payload: rawBody,
    signature,
    secret,
  });

  if (!isValid) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  let parsedEvent: ReturnType<typeof parseRazorpayWebhook>;

  try {
    parsedEvent = parseRazorpayWebhook(rawBody);
  } catch (error) {
    return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
  }

  const eventId = eventIdHeader;

  if (!eventId) {
    return NextResponse.json({ error: "Missing webhook event id" }, { status: 400 });
  }

  try {
    const existing = await prisma.webhookEvent.findUnique({
      where: { eventId },
    });

    if (existing?.processed) {
      return NextResponse.json({
        received: true,
        duplicate: true,
        event: parsedEvent.eventType,
        eventId,
        supported: isRazorpayEventSupported(parsedEvent.eventType),
      });
    }

    const eventRecord = existing
      ? await prisma.webhookEvent.update({
          where: { eventId },
          data: {
            eventType: parsedEvent.eventType,
            payload: parsedEvent.payload,
            processed: false,
            error: null,
          },
        })
      : await prisma.webhookEvent.create({
          data: {
            provider: "RAZORPAY",
            eventType: parsedEvent.eventType,
            eventId,
            payload: parsedEvent.payload,
            processed: false,
          },
        });

    const reconciliation = await reconcileRazorpayEvent({
      eventType: eventRecord.eventType,
      payload: eventRecord.payload as Record<string, any>,
    });

    await prisma.webhookEvent.update({
      where: { eventId },
      data: {
        processed: reconciliation.processed,
        processedAt: reconciliation.processed ? new Date() : null,
        error: reconciliation.error ?? null,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to log webhook" }, { status: 500 });
  }

  return NextResponse.json({
    received: true,
    event: parsedEvent.eventType,
    eventId,
    supported: isRazorpayEventSupported(parsedEvent.eventType),
  });
}
