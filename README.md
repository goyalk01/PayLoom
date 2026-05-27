# Payloom

**Reusable payment infrastructure and checkout orchestration toolkit.**

![Status](https://img.shields.io/badge/status-active-10b981)
![License](https://img.shields.io/badge/license-MIT-0f172a)
![Next.js](https://img.shields.io/badge/nextjs-app%20router-000000)
![Prisma](https://img.shields.io/badge/prisma-orm-0a0a0a)
![Razorpay](https://img.shields.io/badge/razorpay-test%20mode-1a73e8)

Payloom is a TypeScript-first toolkit for payment lifecycle orchestration. It provides a reliable, reusable checkout DX on top of a verified backend flow, with strong separation between pricing, provider adapters, and UI state.

---

# Overview

Payloom exists to turn one-off payment integrations into a clean, repeatable system. Instead of mixing UI callbacks, gateway SDKs, and database writes in a single flow, Payloom organizes the payment lifecycle into composable layers: billing logic, adapter operations, API routes, Zustand-powered UI state, and webhook-ready reliability foundations.

If you already know how to create a payment with a gateway, Payloom is the next step: consistent orchestration, verified state transitions, and reusable primitives you can ship across products.

---

# Features

- Reusable checkout primitives (`CheckoutButton`, `CheckoutModal`, `PricingCard`).
- Centralized Zustand checkout state with explicit lifecycle phases.
- Razorpay order creation and signature verification.
- Provider adapter pattern ready for future gateways.
- Webhook-ready backend structure with signature verification helpers.
- Prisma persistence for `User`, `Order`, `Payment`, and webhook events.
- Thin API routes that delegate to billing and adapters.
- TypeScript-first DX and predictable data contracts.

---

# Architecture

Payloom is organized as a layered system. UI and state are isolated from pricing and gateway logic to keep reliability and testability intact.

```text
UI Components
	↓
useCheckout hook
	↓
Zustand Store (checkout lifecycle)
	↓
API Routes (thin orchestration)
	↓
Billing Layer (trusted pricing)
	↓
Provider Adapter (Razorpay)
	↓
Prisma Persistence / Neon
	↓
Webhook Layer (reliability backstop)
```

**Responsibilities**

- **UI**: Reusable checkout primitives and clear lifecycle UX.
- **Hooks**: Orchestrate client flow and update state.
- **Zustand Store**: Centralized, explicit checkout phases.
- **API Routes**: Validate input and delegate to billing/adapters only.
- **Billing Layer**: Trusted pricing and coupon validation.
- **Adapters**: Provider-specific operations (Razorpay order + verify).
- **Webhook Layer**: Signature verification and event logging.

---

# Checkout Lifecycle

Payloom tracks explicit phases for a reliable UX and deterministic retries:

- `idle`
- `creating_order`
- `checkout_open`
- `verifying`
- `success`
- `failed`
- `dismissed`

---

# Folder Structure

```text
src/
	app/                     Next.js App Router routes
		api/payments/          create-order, verify, webhook routes
		checkout/              demo page for reusable primitives
	lib/                     shared libs (Prisma, utils)
	payloom/
		adapters/              payment provider adapters
		billing/               pricing and coupon placeholders
		core/                  config, router, types, contracts
		hooks/                 reusable checkout hook
		stores/                Zustand checkout store
		ui/                    reusable checkout components
		server/webhooks/       webhook verification helpers
```

---

# Tech Stack

| Layer | Technology |
| --- | --- |
| Web framework | Next.js App Router |
| Language | TypeScript |
| Database | Neon Postgres |
| ORM | Prisma |
| Payment gateway | Razorpay (test mode) |
| State management | Zustand |
| UI | Tailwind + shadcn/ui |

---

# Local Development Setup

```bash
pnpm install
cp .env.example .env
```

Update `.env` with Neon and Razorpay test keys.

```bash
pnpm prisma generate
pnpm prisma migrate dev --name init
pnpm dev
```

# Production Deployment Notes

Use the production-safe Prisma flow and build steps:

```bash
pnpm prisma migrate deploy
pnpm build
pnpm start
```

Ensure:

- `NEXT_PUBLIC_APP_URL` matches your deployed URL.
- `RAZORPAY_WEBHOOK_SECRET` is configured.
- Razorpay webhooks point to a public endpoint (for example, an ngrok URL in test mode).

Optional: open Prisma Studio

```bash
pnpm prisma studio
```

Routes:

- `GET /api/health`
- `GET /checkout`

---

# Environment Variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Runtime connection string (Neon pooled) |
| `DIRECT_URL` | Yes | Migrations connection string (Neon direct) |
| `NEXT_PUBLIC_APP_URL` | Yes | Public app URL |
| `PAYLOOM_ENV` | Yes | Environment mode (`development`, `test`, `production`) |
| `DEFAULT_CURRENCY` | Yes | Default currency (e.g. `INR`) |
| `PAYMENT_PROVIDER` | Yes | Active provider (`razorpay`) |
| `RAZORPAY_KEY_ID` | Yes | Razorpay server key ID |
| `RAZORPAY_KEY_SECRET` | Yes | Razorpay server key secret |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Yes | Razorpay public key for client |
| `RAZORPAY_WEBHOOK_SECRET` | Optional | Webhook signature verification secret |

---

# Payment Flow

1. **Create order** via `/api/payments/create-order` using trusted billing rules.
2. **Open Razorpay Checkout** with provider order ID.
3. **Verify payment** on the backend via `/api/payments/verify`.
4. **Persist state** to Prisma (`Order`, `Payment`).
5. **Webhook-ready reconciliation** for asynchronous event confirmation.

---

# Reliability Philosophy

- **Browser callbacks are not the source of truth.** Payment success is confirmed on the server.
- **Webhooks are the long-term reliability layer.** UI updates are fast, but webhook processing is authoritative.
- **State orchestration is explicit.** Checkout phases make retries and failures deterministic.
- **Pricing stays server-side.** UI never decides the payable amount.

---

# Example Usage

```tsx
import { CheckoutButton } from "@/payloom";

<CheckoutButton
	amount={49900}
	product="Premium Plan"
	userId={userId}
/>;
```

```tsx
import { PricingCard } from "@/payloom";

<PricingCard
	title="Pro"
	price="Rs 999"
	description="For serious builders"
	features={["Unlimited projects", "Priority support", "Advanced exports"]}
	ctaLabel="Upgrade now"
	amount={99900}
	product="Pro Plan"
	userId={userId}
/>;
```

---

# Roadmap

- Webhook hardening and idempotency improvements
- Stripe adapter
- Package extraction and SDK publishing
- Subscription workflows
- Replay-safe event processing

---

# Screenshots

_Coming soon._

- Checkout modal
- Pricing card integration
- Lifecycle states

---

# Contribution

Contributions are welcome. Please open an issue first to discuss proposed changes.

---

.github

# License

MIT
