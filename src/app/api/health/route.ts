import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { payloomConfig } from "@/payloom/core/config";
import { getPaymentProvider } from "@/payloom/core/router";
import type { HealthCheckResponse } from "@/payloom/core/types";

export async function GET() {
  const timestamp = new Date().toISOString();

  try {
    await prisma.$queryRaw`SELECT 1`;

    const response: HealthCheckResponse = {
      ok: true,
      app: "payloom",
      database: "connected",
      provider: getPaymentProvider(),
      environment: payloomConfig.environment,
      timestamp,
    };

    return NextResponse.json(response);
  } catch (error) {
    const response: HealthCheckResponse = {
      ok: false,
      app: "payloom",
      database: "disconnected",
      provider: getPaymentProvider(),
      environment: payloomConfig.environment,
      timestamp,
    };

    return NextResponse.json(response, { status: 503 });
  }
}
