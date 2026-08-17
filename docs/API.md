# SURA SHOP — API Reference

All endpoints return `{ ok: true, data }` or `{ ok: false, error }`. Authenticated
endpoints use the `sura_session` httpOnly JWT cookie. Tenant context is always
resolved server-side from the session — a client can never pass `shopId`.

## Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/send-otp` | — | `{ phone }` → sends OTP (rate-limited 8/10min/IP). Mock provider logs OTP to server console; in dev the response includes `devHint`. |
| POST | `/api/auth/verify-otp` | — | `{ phone, code, name?, email? }` → creates user if new, sets session cookie, returns `redirect`. |
| POST | `/api/auth/logout` | ✓ | Clears session. |

## Shops

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/shops/check-slug?slug=` | — | Live slug availability (validates + reserved list). |
| POST | `/api/shops` | ✓ | Create shop (one per owner in V1). Body: `{ name, category, city?, whatsapp, slug, template }`. |
| PATCH | `/api/shops` | ✓ owner/manager | Update business info / status. Staff forbidden. |
| PATCH | `/api/shops/theme` | ✓ owner/manager | Update theme: template, primaryColor, buttonStyle, font, cardStyle. |

## Products & categories

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/products?q=&page=` | ✓ | Paginated list, search by name/SKU/tag. |
| POST | `/api/products` | ✓ | Create (plan limit enforced → 402 with upgrade message). |
| GET/PATCH/DELETE | `/api/products/[id]` | ✓ | Scoped `{ id, shopId }`; DELETE is soft. Staff cannot delete. |
| GET | `/api/products/export` | ✓ | CSV download. |
| POST | `/api/products/import` | ✓ | multipart CSV; validates all rows before importing; enforces plan limit. |
| GET/POST/PATCH | `/api/categories` | ✓ | CRUD + reorder (`sortOrder`), enable/disable, soft delete via `{ id, delete: true }`. |

## Other

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/uploads` | ✓ | multipart image (JPG/PNG/WebP ≤5MB, magic-byte checked) → `{ url }`. |
| POST | `/api/ai/product-copy` | ✓ | `{ name?, category?, hints? }` → `{ copy: { title, description, tags } }`. |
| POST | `/api/ai/enhance` | ✓ Starter+ | `{ url \| file, productId?, backdrop?, keepBackground? }` → `{ jobId, originalUrl, enhancedUrl, backgroundRemoved, creditsCharged, creditsRemaining }`. 0 credits, 30/day. Original is never deleted. 402 if the plan lacks it. See `AI-PHOTOS.md`. |
| POST | `/api/track` | — | Public storefront events: SHOP_VIEW, PRODUCT_VIEW, WHATSAPP_CLICK (also records an Enquiry), PRODUCT_SHARE, SHOP_SHARE, SEARCH, QR_SCAN. Rate-limited, no PII. |
| POST | `/api/billing/upgrade` | ✓ owner only | `{ planCode }` → creates subscription + Razorpay order (sandbox simulates capture). |
| POST | `/api/billing/webhook` | signature | Razorpay webhook (`payment.captured`, `payment.failed`). |

## Admin (SUPER_ADMIN only)

| Method | Path | Description |
|--------|------|-------------|
| PATCH | `/api/admin/users` | `{ userId, action: suspend\|activate\|delete }` (delete = soft). |
| PATCH | `/api/admin/shops` | `{ shopId, action: suspend\|activate\|delete }`. |
| POST | `/api/admin/plans` | Create/update plan (price, limits, feature flags). |

## Error codes

401 unauthenticated · 402 plan limit · 403 forbidden (role/tenant) · 404 not found
(scoped) · 409 conflict (slug taken, shop exists) · 422 validation · 429 rate limited
· 500 generic (details never leaked).
