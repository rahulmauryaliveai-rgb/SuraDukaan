# SURA SHOP — Security Notes

## Tenant isolation (the core guarantee)

- Every tenant table carries `shopId`.
- The server resolves the shop from the session (`requireShop()` →
  `ShopMember` lookup) — client-supplied shop IDs are never trusted.
- Every query on tenant data filters by `shopId` together with the record id
  (`findFirst({ where: { id, shopId } })`), so cross-tenant reads return null.
- Cross-tenant references (e.g. assigning another shop's category to a product)
  are validated and silently dropped.
- Verified by `tests/tenant-isolation.test.ts` (products, enquiries, analytics,
  service-layer update attempts, category cross-assignment).

## Authentication & sessions

- Mobile OTP: 6-digit code, SHA-256 hashed at rest (peppered with AUTH_SECRET),
  5-minute expiry, single use, max 5 verification attempts, 30s resend cooldown.
- Session: HS256 JWT in an httpOnly, SameSite=Lax, Secure (prod) cookie, 30 days.
- Middleware protects `/dashboard`, `/onboarding` (auth) and `/admin`
  (SUPER_ADMIN role claim, re-checked server-side in the admin layout too).

## Authorization / roles

- SUPER_ADMIN: platform admin panel + admin APIs.
- SHOP_OWNER: full shop control incl. billing.
- SHOP_MANAGER: products/orders, not billing/ownership.
- STAFF: cannot edit shop settings, themes, or delete products (enforced in routes).

## Input handling

- All API input validated with Zod (phones, slugs, prices, URLs, files).
- Slugs: `^[a-z0-9]+(-[a-z0-9]+)*$`, 3–60 chars, reserved-word list blocks
  `/admin`, `/api`, `/dashboard`, etc. from being registered as shops.
- Uploads: MIME allow-list + magic-byte sniffing, 5 MB cap, rate-limited,
  randomized filenames, served statically (no execution).
- SQL injection: Prisma parameterized queries throughout; no raw SQL in app code.
- XSS: React auto-escaping; no `dangerouslySetInnerHTML` with user content
  (only for JSON-LD built from server data via JSON.stringify).

## Rate limiting

In-memory sliding window (swap for Redis in multi-instance deployments):
OTP send 8/10min/IP, verify 15/10min/IP, tracking 120/min/IP, uploads 60/h/shop.

## Other measures

- Soft deletes + audit log (`AuditLog`) for sensitive actions.
- Raw errors never reach clients; consistent `handleApiError`.
- Security headers: nosniff, DENY framing, strict referrer policy.
- Secrets only via env vars; `.env` gitignored; `.env.example` documents keys.
- Razorpay webhook verified with HMAC-SHA256 signature.
- Analytics stores no PII: visitor ids are daily-rotating salted hashes.

## Known V1 limitations (documented trade-offs)

- Rate limiter is per-instance memory — use Redis for horizontal scale.
- Local upload storage is for development; use R2/S3 in production.
- OTP mock provider logs codes to server console — development only.
- Staff invitation flow is schema-ready (`ShopMember`) but UI ships in Phase 3.
