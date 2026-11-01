# Totofia — টোটোফিয়া

Bilingual (বাংলা / English) e-commerce for baby & toddler clothing in Bangladesh.
Single Next.js app: storefront, customer accounts, admin panel and API.

- Bangla at `/` (default), English at `/en` — every page is entirely one language.
- Guest checkout, cash on delivery and online payment via SSLCommerz or aamarPay (bKash, Nagad,
  Rocket, cards) — gateways are configured in the admin.
- Admin panel at `/admin` (orders, catalog, customers, content, settings).

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 + shadcn/ui · next-intl ·
Prisma 7 + PostgreSQL · better-auth · RTK Query · zod · sharp · SSLCommerz · aamarPay · Cloudflare R2 ·
Vitest + Playwright.

## Getting started

Requirements: Node.js 24 LTS, PostgreSQL 17 (or `npx prisma dev` for a throwaway local database).

```bash
npm install                 # also generates the Prisma client
cp .env.example .env        # fill in DATABASE_URL, BETTER_AUTH_SECRET, ADMIN_EMAIL/PASSWORD ...
npm run db:migrate          # create tables
npm run db:seed             # sample catalog, shipping zones, coupons, CMS pages
npm run seed:admin          # first admin account from ADMIN_EMAIL / ADMIN_PASSWORD
npm run dev
```

No local PostgreSQL? `npx prisma dev -n totofia -d` starts one; put the printed TCP URL in
`DATABASE_URL` / `DIRECT_URL` (and the shadow URL in `SHADOW_DATABASE_URL`) and set
`DATABASE_POOL_MAX=1` — it accepts one connection at a time.

## Scripts

| Command                            | What it does                                                 |
| ---------------------------------- | ------------------------------------------------------------ |
| `npm run dev` / `build` / `start`  | Next.js                                                      |
| `npm run check`                    | typecheck + lint + bn/en message parity + unit tests         |
| `npm run test`                     | Vitest unit tests (`tests/unit`)                             |
| `npm run test:e2e`                 | Playwright smoke tests (`tests/e2e`, needs a running server) |
| `npm run i18n:check`               | `messages/bn.json` and `en.json` must have the same keys     |
| `npm run db:migrate` / `db:deploy` | Prisma migrations (dev / production)                         |
| `npm run db:seed`                  | Sample data (wipes catalog tables — development only)        |
| `npm run seed:admin`               | Create or promote the admin from `.env`                      |
| `npm run format`                   | Prettier                                                     |

## Project layout

```
src/
  app/[locale]/        storefront (bn/en) — (shop), (auth), (account) route groups
  app/admin/           admin panel (English, staff only)
  app/api/v1/          REST API used by client components (and a future mobile app)
  app/api/payments/    SSLCommerz callbacks + IPN
  app/api/cron/        scheduled jobs (Vercel Cron)
  server/              backend only ("server-only"): modules/<feature>/{service,schema},
                       domain/ (pure, unit-tested rules), integrations/, http/, auth/, lib/
  components/          ui (shadcn), shared, storefront, product, dashboard, form
  redux/               RTK Query endpoints
messages/              bn.json, en.json
prisma/                schema (multi-file), migrations, seed
tests/                 unit, e2e, mocks (SSLCommerz mock gateway)
```

Rules for contributors are in [`CLAUDE.md`](./CLAUDE.md) (language rule, formatting, where code goes).

## Payments (SSLCommerz, aamarPay)

Cash on delivery is always available. Online gateways are managed in **Admin → Settings →
Payments** (ADMIN role only): turn each gateway on/off, choose **Sandbox** or **Live**, enter the
store id and secret (SSLCommerz store password / aamarPay signature key) and use **Test
connection**. Credentials are stored AES-GCM encrypted with `CREDENTIALS_KEY` — never in env or
git — so going from sandbox to live is an admin change, not a deploy. Copy the callback URLs shown
there into the gateway's merchant panel.

An order is marked paid only after the gateway's own API confirms transaction id, amount and
currency (SSLCommerz validation API / aamarPay transaction check); posted callback fields are never
trusted. The SSLCommerz IPN (`/api/payments/sslcommerz/ipn`) needs a public HTTPS URL. Unpaid
online orders are cancelled and restocked after 60 minutes by the cron job, which first re-checks
the gateway. Refunds are made in the gateway's panel, then marked _Refunded_ in the admin.

Local testing without credentials (mock gateways — no network, no money):

```bash
node tests/mocks/sslcommerz-mock.mjs   # :4010 — store "mock_store", password "mock_pass"
node tests/mocks/aamarpay-mock.mjs     # :4011 — store "mock_aamar", signature "mock_signature"
# .env.local (development only)
SSLCZ_BASE_URL=http://localhost:4010
AAMARPAY_BASE_URL=http://localhost:4011
NEXT_PUBLIC_SITE_URL=http://localhost:3000   # your dev URL
```

Then enable both gateways in Admin → Settings → Payments with the mock credentials (Sandbox).

## Deploying (Vercel)

1. **Database** — managed PostgreSQL in Singapore (Neon or Supabase). `DATABASE_URL` = pooled
   connection, `DIRECT_URL` = direct connection (migrations).
2. **Media** — Cloudflare R2 bucket with a public custom domain (e.g. `media.totofia.com`):
   `STORAGE_DRIVER=r2`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`,
   `NEXT_PUBLIC_MEDIA_URL`.
3. **Vercel project** — set every variable from `.env.example`. Production refuses to start
   without `BETTER_AUTH_SECRET` (32+ chars), an `https://` `NEXT_PUBLIC_SITE_URL`, `CRON_SECRET`,
   `CREDENTIALS_KEY` (32+ chars — keep it safe; changing it means re-entering gateway credentials)
   and R2 storage. `BETTER_AUTH_URL` = the site URL.
4. **Rate limits** — add an Upstash Redis database (`UPSTASH_REDIS_REST_URL` / `_TOKEN`); without it
   limits are per server instance.
5. **Build command** — `npm run db:deploy && npm run build` (applies migrations first).
6. **Cron** — `vercel.json` runs `/api/cron/expire-unpaid` every 15 minutes (Vercel sends
   `Authorization: Bearer $CRON_SECRET`).
7. **After the first deploy** — `npm run seed:admin` against the production database, fill in
   Admin → Settings (phone, email, address, social links, GA4 / Meta Pixel ids), Settings →
   Payments (gateways: test in Sandbox first, then switch to Live), replace the sample
   CMS pages, add real products, set up SMTP (`SMTP_*`, `MAIL_FROM`, `ADMIN_NOTIFY_EMAIL`).
8. **Search engines** — `/sitemap.xml` and `/robots.txt` are generated; preview deployments are
   `noindex`. Submit the sitemap in Google Search Console.

## Backups

- Database: enable the provider's point-in-time recovery (Neon / Supabase) and keep a daily
  `pg_dump` (e.g. a GitHub Action) for off-site copies.
- Media: R2 objects are never overwritten (unique keys); enable R2 bucket versioning or a periodic
  `rclone sync` to a second bucket.
- Restore drill: restore the dump into a fresh database, point a preview deployment at it, check
  orders and images.
