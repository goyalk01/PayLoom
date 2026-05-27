# Payloom

Universal plug-and-play payment toolkit.

## Stack

- Next.js App Router
- TypeScript
- pnpm
- Prisma
- Neon Postgres
- Zod
- shadcn/ui

## Setup

1. Install dependencies:

	```bash
	pnpm install
	```

2. Create a local env file:

	```bash
	cp .env.example .env
	```

	Fill in real Neon values for `DATABASE_URL` and `DIRECT_URL`.

3. Generate Prisma client and run migrations:

	```bash
	pnpm prisma generate
	pnpm prisma migrate dev --name init
	```

4. Start the dev server:

	```bash
	pnpm dev
	```

## Environment

The `.env.example` file includes the required keys. Populate `.env` with:

- `DATABASE_URL`: Neon pooled connection string for runtime
- `DIRECT_URL`: Neon direct connection string for migrations
- `RAZORPAY_KEY_ID`: Razorpay test key ID (server only)
- `RAZORPAY_KEY_SECRET`: Razorpay test key secret (server only)
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`: Razorpay test key ID for the client

## Prisma Commands

```bash
pnpm prisma generate
pnpm prisma migrate dev --name init
```

## Health Route

http://localhost:3000/api/health

## Checkout Route

http://localhost:3000/checkout

## Segment 1 Checklist

- [ ] Next.js App Router scaffolded
- [ ] Prisma connected to Neon
- [ ] Initial schema migrated
- [ ] shadcn/ui initialized
- [ ] Health API responding
- [ ] Payloom core skeleton present
