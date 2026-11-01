@AGENTS.md

# Totofia

Bilingual (Bangla/English) baby & toddler e-commerce for Bangladesh. Next.js full-stack.
Plan: `PLAN.md` · Progress: `docs/progress.md` (dui ta-i local only, gitignored) · Design (repo er baire, git e jay na): `../totofia-design/` (`DESIGN.md` + Stitch HTML exports)

## Rules

- **Language:** Bangla at `/` (default), English at `/en`. A page is entirely one language — never mix
  ("Shop / কেনাকাটা" style labels from the design are not allowed). No hardcoded user-facing strings:
  use `messages/{bn,en}.json` via next-intl; keys must match (`npm run i18n:check`).
- Admin panel (`/admin`) is an internal tool: English UI for now, plain strings allowed there. Content
  it edits is always bilingual (bn + en tabs).
- Numbers, prices, dates via `src/lib/format/intl.ts` (Bangla digits on bn pages).
- Brand: "টোটোফিয়া" (bn) / "Totofia" (en).
- Colors/typography: tokens in `src/app/globals.css` (from `../totofia-design/DESIGN.md` frontmatter). Don't hardcode hex.
- Storefront links/navigation: import from `@/i18n/navigation`, not `next/link`.
- Backend code lives in `src/server/` (`import "server-only"`). Route handlers stay thin:
  `apiHandler` → service. No Prisma calls in pages/components.
- Pin exact dependency versions (latest stable).
- Run `npm run check` before finishing a change.

## Key decisions

- **Architecture:** single Next.js app. Server Components read via services directly (SEO);
  interactive writes go through `app/api/v1/*` Route Handlers + RTK Query (API reusable for a future mobile app).
- **Stack:** Next.js 16 · React 19 · Tailwind v4 + shadcn (Radix) · next-intl · Prisma 7 + PostgreSQL ·
  better-auth · zod · RTK Query · react-hook-form. TypeScript 6 / ESLint 9 until `eslint-config-next` supports newer.
- **Auth:** email + password (better-auth). Phone OTP later, once an SMS provider is chosen.
- **Guest checkout:** allowed — name, phone, address; email optional.
- **Payments:** COD + SSLCommerz first; direct bKash later.
- **Hosting:** Vercel + managed Postgres + Cloudflare R2.

## Dev

- `npm run db:migrate` · `npm run db:seed` (sample catalog, wipes catalog tables) · `npm run check`
- Admin panel: `/admin` — staff login (`/admin/login`). First admin: `npm run seed:admin` (ADMIN_EMAIL / ADMIN_PASSWORD in `.env`)
- Uploaded media: `uploads/` (gitignored), served at `/media/...`

## Phases

0 Setup ✅ · 1 Catalog ✅ · 2 Cart & guest checkout ✅ · 3 Auth & account ✅ · 4 Admin operations ✅ · 5 Online payment ✅ · 6 Launch prep ✅ (code) ·
7 Post-launch: SSLCommerz + aamarPay from admin ✅ · SMS/OTP + courier pending
