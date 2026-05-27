import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  extractRazorpayEventId,
  isRazorpayEventSupported,
  parseRazorpayWebhook,
  verifyRazorpayWebhookSignature,
} from "@/payloom/server/webhooks/razorpay";

const getWebhookSecret = () => {
  return process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET || "";
};

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";
  const secret = getWebhookSecret();

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

  const eventId = parsedEvent.eventId ?? extractRazorpayEventId(parsedEvent.payload);

  try {
    if (eventId) {
      await prisma.webhookLog.upsert({
        where: { eventId },
        update: {
          eventType: parsedEvent.eventType,
          payload: parsedEvent.payload,
          processed: false,
        },
        create: {
          provider: "RAZORPAY",
          eventType: parsedEvent.eventType,
          eventId,
          payload: parsedEvent.payload,
          processed: false,
        },
      });
    } else {
      await prisma.webhookLog.create({
        data: {
          provider: "RAZORPAY",
          eventType: parsedEvent.eventType,
          payload: parsedEvent.payload,
          processed: false,
        },
      });
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to log webhook" }, { status: 500 });
  }

  return NextResponse.json({
    received: true,
    event: parsedEvent.eventType,
    supported: isRazorpayEventSupported(parsedEvent.eventType),
  });
}
