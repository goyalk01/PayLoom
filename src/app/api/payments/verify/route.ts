import { NextResponse } from "next/server";
import { z } from "zod";

import { getPaymentAdapter } from "@/payloom/core/router";
import {
  PayloomConfigError,
  PayloomVerificationError,
} from "@/payloom/core/errors";

const verifySchema = z.object({
  internalOrderId: z.string().min(1),
  providerOrderId: z.string().min(1),
  providerPaymentId: z.string().min(1),
  signature: z.string().min(1),
});

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = verifySchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const adapter = getPaymentAdapter();
    const result = await adapter.verifyPayment(parsed.data);

    if (!result.verified) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof PayloomVerificationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof PayloomConfigError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 });
  }
}
