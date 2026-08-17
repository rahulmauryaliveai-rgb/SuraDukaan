# SURA SHOP — project context for Claude Code

Multi-tenant digital storefront + WhatsApp commerce SaaS by SURA CORP.
Shop owners create a digital shop, add products, and share one link
(`sura.shop/their-shop`). Customers browse without installing anything and
order via WhatsApp click-to-chat.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript strict · Tailwind CSS 4 ·
PostgreSQL + Prisma 6 (engine-free client + `@prisma/adapter-pg`) ·
Vitest · Lucide icons.

## Running it locally

**Do not** run `npm run dev` directly — the launcher handles the database:

```
start-sura.bat           # production mode (fast) + auto-starts embedded Postgres
start-sura-rebuild.bat   # rebuild after code changes, then start
node scripts/dev.mjs --dev   # hot-reload dev mode (slower pages)
```

The embedded Postgres lives in `.pgdata/` on port 5433. Delete `.setup-done`
to re-run schema push + seed.

Checks: `npm run lint` · `npm run typecheck` · `npm run test` · `npm run build`

## Architecture

```
src/app/
  page.tsx                    marketing landing page
  (auth)/                     register, login, verify-otp, forgot-access
  onboarding/                 6-step shop creation wizard
  dashboard/**                shop-owner app
  admin/**                    SUPER_ADMIN panel
  [shopSlug]/                 public storefront (SEO + JSON-LD)
  [shopSlug]/product/[productSlug]/
  api/**                      route handlers
src/lib/
  auth/session.ts   JWT session; requireUser / requireShop / requireAdmin
  products.ts       tenant-scoped product service
  storefront.ts     public read models (published-only)
  plans.ts          feature gating; limits come from the Plan table
  ai/enhance.ts     photo clean-up pipeline (sharp), pluggable bg removal
  ai/segment.ts     offline background segmentation; refuses when unsure
  credits.ts        AI credit ledger; atomic spend + refund
  otp/ storage/ ai.ts payments.ts   swappable provider abstractions
  slug.ts whatsapp.ts validation.ts analytics.ts
prisma/schema.prisma          20-model multi-tenant schema
tests/                        vitest, incl. tenant-isolation.test.ts
```

## Non-negotiable rules

1. **Tenant isolation.** Never trust a client-supplied `shopId`. Always derive
   the shop from the session via `requireShop()`, and always query with
   `{ id, shopId }` together. `tests/tenant-isolation.test.ts` guards this.
2. **No hard-coded plan limits.** Read them from the `Plan` table through
   `lib/plans.ts`. Admins edit plans at `/admin/plans`.
3. **WhatsApp clicks are enquiries, not orders.** Keep that wording in the UI.
4. **Never leak raw errors** to users — go through `handleApiError`.
5. **Mobile-first.** Owners manage the shop from a phone; customers arrive from
   WhatsApp on mobile.
6. Soft-delete (`deletedAt`) rather than hard-delete tenant data.
7. **AI never redraws the product.** Enhancement corrects exposure, colour and
   framing only, and the original image is always kept so the seller can
   revert. See `docs/AI-PHOTOS.md`.

## Dev logins (seeded, development only)

- Admin: `9999999999`
- Demo shop owner: `8888888888` (shop: `/urban-threads`)
- OTP is printed to the server console by the mock SMS provider.

## Deployment

Vercel + Supabase + Vercel Blob. See `docs/DEPLOY.md`.
`push-to-github.bat` commits and pushes; Vercel auto-deploys from `main`.

More detail: `README.md`, `docs/ARCHITECTURE.md`, `docs/API.md`, `docs/SECURITY.md`,
`docs/AI-PHOTOS.md`.
