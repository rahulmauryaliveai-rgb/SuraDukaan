# SURA SHOP — Architecture

## Overview

Single Next.js 15 application (App Router) serving three surfaces from one codebase:

1. **Marketing** — `/`, pricing, legal pages (static/ISR-friendly).
2. **Tenant app** — `/onboarding`, `/dashboard/**` (server components + client forms,
   session-gated, PWA-installable via `/manifest.webmanifest`).
3. **Public storefronts** — `/[shopSlug]` and `/[shopSlug]/product/[productSlug]`
   (server-rendered, SEO-complete: canonical, OG/Twitter, LocalBusiness/Product JSON-LD,
   sitemap, robots).

Route precedence: real folders (`/dashboard`, `/admin`, `/pricing`, …) win over the
`[shopSlug]` catch-all; the reserved-slug list prevents shops from ever claiming those
names.

## Layers

```
app/api/**            thin route handlers: parse → authorize → service → respond
lib/                  domain services & cross-cutting concerns
  auth/session.ts     JWT session + requireUser/requireShop/requireAdmin
  products.ts         tenant-scoped product service (create/update w/ relations)
  storefront.ts       public read models (published-only queries)
  plans.ts            feature gating from DB-defined plans
  otp/, storage/, ai.ts, payments.ts    swappable provider abstractions
  analytics.ts        privacy-preserving event tracking
prisma/schema.prisma  20-model relational schema, soft deletes, audit log
```

## Key decisions & trade-offs

- **Prisma engine-free client** (`engineType = "client"` + `@prisma/adapter-pg`):
  no native engine binaries at runtime → smaller deploys, works on serverless.
  Migrations still use the Prisma CLI (schema engine) at dev/deploy time.
- **OTP auth instead of passwords**: matches the audience (Indian SMB owners who
  live on their phones); provider abstraction keeps MSG91/Twilio a config change.
- **Click-to-chat WhatsApp** (V1): zero API dependency and zero customer friction.
  Clicks are recorded as *enquiries* — deliberately not called "orders".
- **Plan limits in the database**: admins change pricing without deploys; the
  gate (`canAddProduct`) lives in one place.
- **Server components for reads, JSON APIs for writes**: fewer round trips,
  smaller client bundles (~103 kB shared first-load JS).
- **In-memory rate limiting**: right-sized for single-instance V1; the interface
  allows a Redis swap without touching call sites.

## Data flow: the WhatsApp order

1. Customer opens `/{shop}/product/{slug}` (SSR, tracked as PRODUCT_VIEW).
2. Picks variant + quantity → client composes the pre-filled message.
3. Tap "Order on WhatsApp" → `POST /api/track` (WHATSAPP_CLICK → Enquiry row)
   → `window.open(wa.me/<number>?text=…)`.
4. Owner sees the enquiry in `/dashboard/enquiries` and converts it in chat.

## Scaling path

- DB indexes on every hot path (slug lookups, shopId composites, analytics).
- Pagination everywhere; no unbounded queries.
- Next steps when traffic grows: Redis (rate limits + cached storefronts),
  R2/S3 + CDN for images, read replicas, per-shop ISR for storefronts.
