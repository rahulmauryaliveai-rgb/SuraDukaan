# Publishing SURA SHOP on Vercel

Total time: about 15 minutes. Everything below is free-tier.

---

## Step 1 — Create the database (Supabase)

1. Go to **https://supabase.com** → sign in with GitHub → **New project**
2. Fill in:
   - **Name:** `sura-shop`
   - **Database Password:** create a strong one and **save it** — you need it twice below
   - **Region:** Mumbai (`ap-south-1`) for Indian users
3. Click **Create new project** and wait ~2 minutes for it to finish provisioning.
4. Go to **Project Settings → Database → Connection string**. Copy two URIs:

   | Which | Where | Port | Used for |
   |---|---|---|---|
   | **Transaction pooler** | "Connection pooling" section | `6543` | `DATABASE_URL` |
   | **Direct connection** | "Connection string → URI" | `5432` | `DIRECT_URL` |

   In both, replace `[YOUR-PASSWORD]` with the password from step 2.

## Step 2 — Create the tables and demo data

On your PC, double-click **`setup-cloud-db.bat`** in the suraDukaan folder.
Paste the **direct connection** URI (port 5432) when it asks.

It creates all tables and seeds the plans, admin user and the Urban Threads demo shop.

## Step 3 — Import the project into Vercel

1. Go to **https://vercel.com** → sign in with GitHub
2. **Add New… → Project**
3. Find **SuraDukaan** in the repo list → **Import**
   (if it isn't listed, click *Adjust GitHub App Permissions* and grant access to the repo)
4. **Don't click Deploy yet** — open **Environment Variables** first and add these:

   | Name | Value |
   |---|---|
   | `DATABASE_URL` | the **pooler** URI (port **6543**) |
   | `DIRECT_URL` | the **direct** URI (port **5432**) |
   | `AUTH_SECRET` | any random string, 32+ characters |
   | `APP_URL` | `https://sura-dukaan.vercel.app` (fix after step 5 if your URL differs) |
   | `STORAGE_PROVIDER` | `blob` |

5. Click **Deploy** and wait ~3 minutes.

## Step 4 — Turn on image storage (Vercel Blob)

In your new project: **Storage → Create Database → Blob → Create**.
Vercel injects `BLOB_READ_WRITE_TOKEN` automatically. Then **Deployments → ⋯ → Redeploy**
so the new variable is picked up. Product photo uploads now work.

## Step 5 — Check the live site

Open your Vercel URL:

- `/` — landing page
- `/urban-threads` — demo storefront
- `/admin` — admin panel
- `/register` — create a shop

If your real URL differs from what you set in `APP_URL`, update that variable
(**Settings → Environment Variables**) and redeploy. It's used for canonical URLs,
share links and QR codes.

---

## Logging in on the live site

Login is OTP-based. Without an SMS provider configured, the OTP is **not** sent by SMS
and (for security) is **not** shown in the browser. You have two options:

**A. Read it from the server log (fine for testing)**
Vercel → your project → **Logs**, request the OTP on the site, and look for:
`[MockOTP] OTP for 9999999999: 123456`

**B. Send real SMS (do this before real customers use it)**
Create an account at **MSG91**, then add in Vercel:
`SMS_PROVIDER=msg91` and `SMS_API_KEY=<your key>`, and redeploy.

Seeded accounts: **9999999999** (admin) · **8888888888** (demo shop owner).

---

## Later: your own domain

Vercel → **Settings → Domains → Add**, enter e.g. `sura.shop`, and point the DNS
records Vercel shows you at your registrar. Then set `APP_URL` to
`https://sura.shop` and redeploy.

## Updating the live site

Any push to the `main` branch deploys automatically. Locally, just double-click
**`push-to-github.bat`** — Vercel picks it up within seconds.

## Notes

- `embedded-postgres` (the local dev database) is an **optional** dependency and is
  skipped on Vercel via the install command in `vercel.json`.
- Serverless functions are stateless, so the in-memory rate limiter resets per
  instance. For serious traffic, swap it for Redis (see `src/lib/rate-limit.ts`).
- Razorpay stays in sandbox mode until you add the three `RAZORPAY_*` keys.
