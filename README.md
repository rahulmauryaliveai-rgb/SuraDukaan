# SURA SHOP — Your Shop. One Link.

Multi-tenant digital storefront + WhatsApp commerce SaaS by **SURA CORP**.

Shop owners register with their mobile number, create a digital shop, add products, and share one link (`sura.shop/sharma-fashion`) on WhatsApp, social media, or via QR code. Customers browse without installing anything and order through WhatsApp click-to-chat.

---

## Tech stack

| Layer      | Technology |
|------------|------------|
| Frontend   | Next.js 15 (App Router), React 19, TypeScript (strict), Tailwind CSS 4, Lucide icons |
| Backend    | Next.js API route handlers + server components |
| Database   | PostgreSQL + Prisma ORM 6 (engine-free client with `@prisma/adapter-pg`) |
| Auth       | Mobile OTP → JWT session cookie (`jose`), provider abstraction (Mock / MSG91 / Twilio) |
| Storage    | Local disk in dev; S3/R2-compatible provider interface for production |
| Payments   | Razorpay (sandbox simulation when keys absent; webhook handler included) |
| WhatsApp   | Click-to-chat links (`wa.me`) — no Business API needed for V1 |
| Testing    | Vitest (unit + DB integration incl. tenant isolation) |

## Quick start

```bash
# 1. Install dependencies (also runs prisma generate)
npm install

# 2. Start PostgreSQL
docker compose up -d

# 3. Configure environment
cp .env.example .env    # defaults match docker-compose; set a strong AUTH_SECRET

# 4. Create schema + seed demo data
npm run db:push
npm run db:seed

# 5. Run
npm run dev
```

Open http://localhost:3000

**Development logins** (OTP is printed in the terminal by the mock SMS provider):

| Role        | Phone       | Lands on |
|-------------|-------------|----------|
| Super admin | 9999999999  | `/admin` |
| Demo owner  | 8888888888  | `/dashboard` |
| New user    | any valid mobile | onboarding wizard |

Demo storefront: http://localhost:3000/urban-threads

## Scripts

```bash
npm run dev         # dev server
npm run build       # prisma generate + production build
npm run start       # serve production build
npm run lint        # eslint
npm run typecheck   # tsc --noEmit
npm run test        # vitest (DB tests auto-skip if Postgres is down)
npm run db:migrate  # create/apply dev migration
npm run db:deploy   # apply migrations in production
npm run db:push     # push schema without migration files (first setup)
npm run db:seed     # seed plans, admin, demo shop
npm run db:studio   # browse data
```

## Architecture

```
src/
  app/
    page.tsx                  # marketing landing page
    (auth)/                   # register, login, verify-otp, forgot-access
    onboarding/               # 6-step shop creation wizard
    dashboard/                # shop-owner app (products, categories, enquiries,
                              # analytics, customize, qr-code, billing, settings)
    admin/                    # SUPER_ADMIN panel (users, shops, plans, settings)
    [shopSlug]/               # public storefront (SEO + JSON-LD)
    [shopSlug]/product/[productSlug]/   # product page, WhatsApp order CTA
    api/                      # route handlers (auth, shops, products, categories,
                              # uploads, ai, track, billing, admin)
  components/                 # design system + feature components
  lib/                        # db, auth/session, otp, storage, ai, payments,
                              # plans (feature gating), slug, whatsapp, validation
  generated/prisma/           # generated Prisma client (gitignored)
prisma/schema.prisma          # multi-tenant schema
prisma/seed.ts                # dev seed
tests/                        # vitest suites incl. tenant isolation
```

### Multi-tenancy & security

- Every tenant entity carries `shopId`. **Tenant context is always derived from the
  authenticated session** (`requireShop()`), never from client input.
- All product/category/enquiry/analytics queries filter by `{ id, shopId }` together.
- `tests/tenant-isolation.test.ts` proves Shop A can never read or mutate Shop B data
  (products, enquiries, analytics, cross-tenant category assignment).
- Middleware guards `/dashboard`, `/onboarding` (auth) and `/admin` (SUPER_ADMIN).
- OTPs are stored hashed, expire in 5 minutes, max 5 attempts, resend cooldown,
  per-IP rate limits on auth, tracking, and upload endpoints.
- Uploads: MIME + magic-byte validation, 5 MB limit, images only.
- Soft deletes (`deletedAt`) on users, shops, products, categories; audit log on
  sensitive actions. Raw errors are never shown to users.

### Feature gating

Plan limits live in the `Plan` table (seeded: Free ₹0/20 products, Starter ₹499/100,
Business ₹1,499/unlimited, Pro ₹2,999). `lib/plans.ts` resolves the active plan per
shop; nothing is hard-coded. Hitting a limit shows an upgrade prompt (never a silent
failure).

### Provider abstractions

- **OTP/SMS** — `lib/otp/provider.ts`: `SMS_PROVIDER=mock|msg91|twilio`
- **Storage** — `lib/storage/index.ts`: `STORAGE_PROVIDER=local|s3`
- **AI** — `lib/ai.ts`: mock provider generates product copy; swap via `AI_PROVIDER`
- **Payments** — `lib/payments.ts`: Razorpay; simulated sandbox without keys

## Environment variables

See `.env.example`. Required in production: `DATABASE_URL`, `AUTH_SECRET` (32+ chars),
`APP_URL`. Optional: SMS, Razorpay, email, AI, and S3/R2 storage keys.

## Deployment

**Vercel** (recommended)
1. Push the repo to GitHub, import into Vercel.
2. Add a managed Postgres (Neon/Supabase/RDS) and set `DATABASE_URL`.
3. Set `AUTH_SECRET`, `APP_URL` (your domain), and any provider keys.
4. Build command is the default (`npm run build` runs `prisma generate` first).
5. Run `npm run db:deploy && npm run db:seed` once against the production DB.
6. Set `STORAGE_PROVIDER=s3` with R2/S3 credentials (Vercel's filesystem is ephemeral —
   implement the S3 provider in `lib/storage` with `@aws-sdk/client-s3`).

**VPS / Docker**: run `docker compose up -d` for Postgres, `npm run build && npm start`
behind Nginx/Caddy with HTTPS.

### Razorpay
Set `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`. Point the
webhook to `POST /api/billing/webhook` (events: `payment.captured`, `payment.failed`).
Without keys, upgrades run in an explicit sandbox mode so the whole flow is testable.

### Future WhatsApp Business API
V1 uses click-to-chat. When you adopt the Business API, add a provider in `lib/`
mirroring the OTP pattern; enquiry tracking (`Enquiry` table) already records intent
events to reconcile against real conversations.

## Testing

```bash
npm run test
```
Unit suites (slug, WhatsApp URLs/messages, validation, plan limits, OTP providers)
always run. Integration suites (tenant isolation) run when `DATABASE_URL` is reachable
— start Postgres first with `docker compose up -d`.

## Roadmap (architected for)

Phase 2: custom domains (`ShopDomain` table exists), online payments, customer
accounts, coupons, reviews. Phase 3: WhatsApp Business API, order management, GST
invoices, staff roles (`ShopMember.role` exists). Phase 4: AI photography/marketing.
Phase 5: mobile apps, marketplace discovery.

---

⚠️ Legal pages (`/privacy`, `/terms`, `/refund-policy`) contain placeholder copy —
review with a lawyer before launch. Seed credentials are development-only.
