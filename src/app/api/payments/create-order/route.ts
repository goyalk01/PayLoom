import { NextResponse } from "next/server";
import { z } from "zod";

import { getPaymentAdapter } from "@/payloom/core/router";
import {
  PayloomConfigError,
  PayloomValidationError,
} from "@/payloom/core/errors";

const createOrderSchema = z.object({
  userId: z.string().min(1),
  productName: z.string().min(1),
  baseAmount: z.number().int().positive(),
  currency: z.enum(["INR", "USD", "EUR"]).optional(),
  metadata: z.record(z.unknown()).optional(),
  couponCode: z.string().nullable().optional(),
});

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = createOrderSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const adapter = getPaymentAdapter();
    const result = await adapter.createOrder(parsed.data);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof PayloomValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof PayloomConfigError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
