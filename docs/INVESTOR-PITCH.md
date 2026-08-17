# SURA SHOP — Investor Pitch & Financial Plan

**SURA CORP · Seed Round · Prepared August 2026**

> **How to read this document.** Section A is fact — it describes software that
> exists today and can be demonstrated live. Sections B onward are a *plan*, built
> from stated assumptions. Nothing has been spent on marketing yet. Every
> assumption is labelled so you can challenge it — investors will, and you should
> be able to defend each one in your own words.

---

## A. What already exists (verifiable today)

A complete, working multi-tenant SaaS platform. Not a prototype — it builds,
passes automated tests, and runs.

| Capability | Status |
|---|---|
| Shop owner signup via mobile OTP | Working |
| 6-step shop creation wizard with live URL availability | Working |
| Product catalogue — photos, variants, colours, stock, CSV import/export | Working |
| 16 distinct storefront themes, category-matched | Working |
| Shop "front door" page → **Step In** → product catalogue | Working |
| WhatsApp click-to-chat ordering with pre-filled message | Working |
| Enquiry tracking, analytics, QR code generation | Working |
| Owner dashboard, admin panel, plan management | Working |
| Razorpay subscription architecture + webhooks | Working (sandbox) |
| Monthly/Yearly pricing with AI credit ledger | Working |
| 16 live demo storefronts across trades | Working |

**Engineering quality:** TypeScript strict mode, 56 automated tests including a
dedicated multi-tenant isolation suite proving Shop A can never read Shop B's
data, full audit logging, soft deletes, rate limiting.

**Cash spent to date: effectively ₹0.** Built by the founder using AI-assisted
development. A comparable agency build would typically be quoted at **₹15–25
lakh** and take 4–6 months. This is the single most capital-efficient part of
the story — lead with it.

---

## B. The problem

India has **7.86 crore MSMEs registered on the Udyam portal** as of February
2026, and **98.9% of them are micro enterprises** — the kirana, the sweet shop,
the boutique, the mobile accessory stall.

Almost all of them already sell over WhatsApp. Almost none of them have a
product catalogue. What they send customers today is a blurry photo and a price
typed in a chat. The result:

- No professional presence — the shop looks smaller than it is
- No searchable catalogue — the customer asks "kya rate hai?" for every item
- No repeat discovery — the conversation dies, nothing is saved
- Existing e-commerce tools assume literacy in DNS, hosting, SEO, inventory

**They don't need an online store. They need their shop to look professional in
one link.**

---

## C. The solution

A shop owner registers with a mobile number and, in about five minutes, has:

`sura.shop/sharma-jewellers`

One link. A front-door page with their photo, logo, address and phone, a
**Step In** button, and a themed catalogue behind it. Customers browse without
installing anything and tap **Order on WhatsApp** — a pre-filled message lands
in the owner's normal WhatsApp.

**The wedge:** we don't replace WhatsApp. We make WhatsApp selling look
professional.

---

## D. Market size

| Layer | Size | Basis |
|---|---|---|
| **TAM** | 7.86 crore registered MSMEs | Udyam Portal + UAP, Feb 2026 |
| **SAM** — retail/trade micro-enterprises with a smartphone selling via WhatsApp | ~1–1.5 crore | Estimate; verify with a paid market report before the raise |
| **SOM** — realistic 5-year capture at 0.4% of SAM | ~50,000 paying shops | Our target |

At a blended ARPU of ₹14,880/year, 50,000 paying shops = **₹74 crore ARR**.

> ⚠️ The SAM figure is an estimate, not a sourced statistic. Before pitching,
> commission or cite a specific report (RedSeer, Bain–Flipkart, IBEF) so you can
> name the source when asked. Investors will test this number.

---

## E. Business model

Subscription, billed monthly or yearly (yearly ≈ 20% cheaper, "2 months free").

| Plan | Monthly | Yearly (per month) | Products | AI credits/month |
|---|---|---|---|---|
| Free | ₹0 | — | 20 | 3 lifetime trial |
| Starter | ₹699 | ₹549 | 100 | 5 |
| Business | ₹1,999 | ₹1,599 | Unlimited | 30 |
| Pro | ₹4,999 | ₹3,999 | Unlimited | 100 |

**Second revenue line:** AI credit top-up packs — ₹199/25, ₹449/60, ₹999/150.
Gross margin 47–56%. These never expire and are bought repeatedly by clothing
sellers launching new collections.

**Blended ARPU assumption:** ₹1,240/month, from a mix of 60% Starter, 32%
Business, 8% Pro.

---

## F. Unit economics

| Metric | Base case | Conservative |
|---|---|---|
| Blended ARPU | ₹1,240/mo | ₹1,240/mo |
| Cost of service (AI + infra + payment fees) | ₹115/mo | ₹150/mo |
| **Gross margin** | **91%** | **88%** |
| Blended CAC | ₹3,280 | ₹4,500 |
| Monthly churn | 4% | 7% |
| Average customer life | 25 months | 14 months |
| **LTV** | **₹27,900** | **₹15,300** |
| **LTV : CAC** | **8.5 : 1** | **3.4 : 1** |
| **CAC payback** | **2.9 months** | **4.1 months** |

Even the conservative case clears the 3:1 LTV:CAC bar investors look for. Show
both columns — offering only the optimistic case damages credibility.

---

## G. Cost to build and run — 18 months

### G1. Team

Phased hiring, not everyone from day one.

**Months 1–3 — build & closed beta (5 people)**

| Role | Count | ₹/month |
|---|---|---|
| Founder / CEO | 1 | 60,000 |
| Senior full-stack engineer | 1 | 1,50,000 |
| Full-stack engineer | 1 | 90,000 |
| Product designer (contract) | 1 | 70,000 |
| Customer success (Hindi + regional) | 1 | 32,000 |
| **Monthly burn** | **5** | **₹4,02,000** |

**Months 4–9 — launch & early growth (8 people)**

| Role | Count | ₹/month |
|---|---|---|
| Founder / CEO | 1 | 60,000 |
| Senior full-stack engineer | 1 | 1,50,000 |
| Full-stack engineers | 2 | 1,80,000 |
| Growth / performance marketer | 1 | 90,000 |
| Customer success | 2 | 64,000 |
| Inside sales | 1 | 28,000 |
| **Monthly burn** | **8** | **₹5,72,000** |

**Months 10–18 — scale (10 people)**

| Role | Count | ₹/month |
|---|---|---|
| Core team as above | 6 | 4,80,000 |
| Customer success | 3 | 96,000 |
| Inside sales | 2 | 56,000 |
| Ops / part-time CA | 1 | 15,000 |
| **Monthly burn** | **10** | **₹6,47,000** |

**Total team cost, 18 months: ₹1.05 crore** (figures are CTC)

### G2. Marketing

| Period | ₹/month | Total |
|---|---|---|
| Months 1–3 (content, community, no paid) | 50,000 | ₹1.5 L |
| Months 4–9 (paid acquisition begins) | 2,50,000 | ₹15.0 L |
| Months 10–18 (scale) | 4,00,000 | ₹36.0 L |
| **Total marketing spend** | | **₹52.5 lakh** |

This is the answer to *"what is the total marketing expenditure?"* — **₹52.5
lakh over 18 months.** Nothing has been spent so far.

### G3. Technology & AI

| Item | Months 1–6 | Months 7–12 | Months 13–18 |
|---|---|---|---|
| Hosting (Vercel/VPS), database, storage | ₹12,000/mo | ₹25,000/mo | ₹45,000/mo |
| SMS OTP (₹0.20 per message) | ₹4,000/mo | ₹10,000/mo | ₹20,000/mo |
| AI image generation (₹3.5/credit) | ₹4,000/mo | ₹10,000/mo | ₹20,000/mo |
| **Sub-total** | **₹1.2 L** | **₹2.7 L** | **₹5.1 L** |

**Total technology + AI, 18 months: ₹9 lakh**

Note how small this is. Software margins are the point — the cost is people and
marketing, not servers.

### G4. Other

Company formation, GST, CA, legal, insurance, SaaS tools, co-working, travel:
**₹60,000/month × 18 = ₹10.8 lakh**

### G5. Total

| Line item | 18-month cost |
|---|---|
| Team | ₹1.05 Cr |
| Marketing | ₹52.5 L |
| Technology + AI | ₹9.0 L |
| Legal, ops, admin | ₹10.8 L |
| **Sub-total** | **₹1.77 Cr** |
| Contingency (12%) | ₹21.2 L |
| **Total 18-month cost** | **₹1.98 Cr** |

---

## H. Revenue projection

**Assumptions:** 5% free→paid conversion, ₹1,240 blended ARPU, 4% monthly churn.

| Month | Free shops | Paying shops | MRR | ARR run-rate |
|---|---|---|---|---|
| 6 | 2,000 | 100 | ₹1.24 L | ₹15 L |
| 9 | 6,000 | 300 | ₹3.72 L | ₹45 L |
| 12 | 14,000 | 700 | ₹8.68 L | ₹1.04 Cr |
| 15 | 22,000 | 1,100 | ₹13.6 L | ₹1.64 Cr |
| **18** | **32,000** | **1,600** | **₹19.8 L** | **₹2.38 Cr** |

Cumulative revenue collected over 18 months: **≈ ₹1.04 crore** (including credit
top-up sales).

**Net cash requirement: ₹1.98 Cr cost − ₹1.04 Cr revenue ≈ ₹0.94 Cr**, before
timing effects.

---

## I. The ask

> **Raising ₹2 crore for 18 months of runway.**

| Use of funds | Amount | Share |
|---|---|---|
| Team | ₹1.05 Cr | 53% |
| Marketing & acquisition | ₹52.5 L | 26% |
| Technology & AI | ₹9.0 L | 5% |
| Legal, ops, admin | ₹10.8 L | 5% |
| Contingency | ₹21.2 L | 11% |

**Milestone at month 18:** ₹2.4 Cr ARR, 1,600 paying shops, 32,000 free shops,
proven CAC payback under 3 months — the profile needed to raise a Series A.

---

## J. Go-to-market

**1. The built-in loop (free, already in the product).** Every free storefront
carries "Powered by SURA SHOP" linking home. Each shop shares its link on
WhatsApp dozens of times a week. Every customer who views a catalogue sees us.
This is organic distribution built into the product, and it structurally lowers
CAC over time.

**2. Vernacular performance marketing.** Meta and Google in Hindi, Marathi,
Tamil, Telugu, Gujarati. Search intent is already there: *"online shop kaise
banaye"*, *"WhatsApp business catalogue"*.

**3. Channel partners.** Mobile recharge shops, CAs, printing shops and local
computer centres already serve this exact customer. Revenue share per signup.

**4. Trade associations.** Market and traders' associations give access to
hundreds of shops in one relationship.

**5. Referral credits.** Refer a shop, both get AI credits — pays in COGS
(₹3.5/credit) rather than cash.

---

## K. Technology stack

| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js 15 (App Router) | Server rendering for SEO on every storefront |
| Language | TypeScript (strict) | Fewer production defects |
| UI | React 19, Tailwind CSS 4 | Fast iteration, consistent design system |
| Database | PostgreSQL 14+ | Relational integrity for multi-tenant data |
| ORM | Prisma 6 (engine-free + pg adapter) | Type-safe queries, serverless-friendly |
| Auth | Mobile OTP → JWT cookie | No passwords for non-technical users |
| Payments | Razorpay | UPI, cards, e-mandate for subscriptions |
| Messaging | WhatsApp click-to-chat | Zero API dependency at V1 |
| Media | S3-compatible object storage | Cheap, scalable image hosting |
| AI | Image editing models via API | Photo clean-up, scenes, model try-on |
| Testing | Vitest | 56 tests incl. tenant isolation |

**Team required to operate it: 3 engineers.** Everything is one codebase and one
database — deliberately boring, cheap infrastructure.

---

## L. The AI moat

Phase 1 **Enhance** (free on paid plans): background removal, studio backdrop,
lighting correction. Product pixels untouched — no misrepresentation risk.

Phase 2 **Generate** (1 credit): new scenes, flat-lays, extra angles.

Phase 3 **Try-on** (2 credits): garment shown on a model.

Cost ₹3.5/credit against ₹1,240 ARPU means AI is 5–7% of revenue — a premium
feature funded comfortably by the subscription, and the top-up packs are
profitable in their own right.

**Why this matters competitively:** a shopkeeper's bad phone photo is the single
biggest reason their catalogue looks untrustworthy. Fixing that in one tap is a
visible, emotional "wow" moment that a plain catalogue tool cannot match.

---

## M. Risks — and our answers

| Risk | Our answer |
|---|---|
| **SMB churn is high** | Free tier retains shops even when they stop paying; the shop link is embedded in their WhatsApp, printed QR and visiting cards — switching cost is real |
| **Recurring payment failures** (RBI e-mandate friction) | Yearly billing pushed hard with a 20% discount; monthly exists only to lower the entry barrier |
| **AI could misrepresent products** | Enhance never alters product pixels; generated images carry an "AI visualisation" label; original photo always retained |
| **Competition** (Dukaan, Bikayi, Shopify) | They sell "an online store". We sell "your shop, professionally, in one link" — narrower wedge, far simpler onboarding, AI photography they don't offer |
| **Free→paid conversion below 5%** | At 3% we need ₹5,470 CAC to stay viable — still within range; the model is stress-tested in the conservative column |
| **Founder-dependency on AI-built code** | Codebase is documented, typed and tested; first senior hire's job is ownership transfer |

---

## N. Suggested pitch deck — 12 slides

| # | Slide | The one line that lands |
|---|---|---|
| 1 | **Title** | SURA SHOP — Your Shop. One Link. |
| 2 | **Problem** | 7.86 crore MSMEs sell on WhatsApp with blurry photos and no catalogue |
| 3 | **Solution** (live demo) | Open `sura.shop/sharma-jewellers` on your phone, right now |
| 4 | **Why now** | UPI + cheap data + WhatsApp Business have made every shop digital-ready — except their catalogue |
| 5 | **Product** | 16 themes, Step In front door, WhatsApp ordering, QR — all built |
| 6 | **AI differentiator** | Before/after of a real phone photo → studio photo |
| 7 | **Market** | 7.86 Cr TAM → 1–1.5 Cr SAM → 50,000 shops = ₹74 Cr ARR |
| 8 | **Business model** | ₹549–₹4,999/month + credit packs; 91% gross margin |
| 9 | **Unit economics** | CAC ₹3,280 · payback 2.9 months · LTV:CAC 8.5:1 |
| 10 | **Traction & capital efficiency** | Full platform built for ₹0 cash. Show the test suite passing |
| 11 | **Go-to-market** | Every free storefront markets us — built-in distribution loop |
| 12 | **The ask** | ₹2 Cr for 18 months → ₹2.4 Cr ARR, 1,600 paying shops |

### Delivery notes

- **Slide 3 must be a live demo on a phone, not a screenshot.** Nothing else in
  the deck will beat watching a shop open in two seconds and a WhatsApp order
  arrive.
- **Lead with capital efficiency.** "We built the entire platform before raising
  a rupee" pre-empts the biggest objection about a first-time founder.
- **Never present a single scenario.** Show base and conservative side by side.
- **Know your three weakest numbers** — SAM, free→paid conversion, and churn.
  Volunteer them before an investor finds them.

---

## O. What to do before you pitch

1. **Get real users.** Ten paying shops beats any projection in this document.
   Even 50 free shops with usage data changes the conversation entirely.
2. **Source the SAM figure** from a citable report.
3. **Deploy to production** so the demo never depends on your laptop.
4. **Record a 60-second demo video** as a fallback if the venue's wifi fails.
5. **Prepare the data room:** this document, the deck, the codebase, the test
   report, and a simple 18-month cash-flow spreadsheet.

---

*Financial projections in this document are estimates based on stated
assumptions, not guarantees. Market figures marked as estimates require
independent verification before use in a funding round.*

**Sources:** MSME registration figures — Udyam Registration Portal data as
reported by IBEF and the Ministry of MSME, February–March 2026.
