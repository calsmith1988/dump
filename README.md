# dump — Daily Fibre deposit pre-order site

A single-page Next.js site that takes real deposit pre-orders via Stripe Checkout. It stores preorders in Postgres, saves cards for later off-session balance charging, and includes a simple admin UI for refunds and bulk charging.

> Everyone does it. We make it easier.

---

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** with brand tokens locked to the `dump` guidelines
- **Stripe** Node SDK (server) + deposit Checkout + webhook flow
- **Prisma + Postgres** for preorder persistence
- **`next/font`** loading Playfair Display (wordmark only) and Inter (everything else)
- Deploys cleanly to **Vercel**

---

## Getting started

### 1. Install

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.local.example .env.local
```

Then fill in:

- `DATABASE_URL` — your Render Postgres connection string
- `STRIPE_SECRET_KEY` — from https://dashboard.stripe.com/apikeys (use test keys first)
- `STRIPE_WEBHOOK_SECRET` — see "Meta Conversions API (server-side tracking)" below
- `FULL_PRICE_PENCE`, `DEPOSIT_PENCE`, `BALANCE_PENCE`
- `BALANCE_COLLECTION_MODE` — `payment_intent` or `invoice`
- `META_CAPI_ACCESS_TOKEN` — see "Meta Conversions API (server-side tracking)" below
- `META_CAPI_TEST_EVENT_CODE` — optional, for testing CAPI in Events Manager
- `ADMIN_PASSWORD` — password gate for `/admin`
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL` — for failed balance recovery emails
- `NEXT_PUBLIC_SITE_URL` — `http://localhost:3000` locally, your real domain in production

### 3. Run

```bash
npm run dev
```

Open http://localhost:3000.

---

## Stripe setup

1. Go to Stripe Dashboard → **Products** → **Add product**.
2. Name it something like `dump Daily Fibre`.
3. Test with Stripe test card `4242 4242 4242 4242`, any future expiry, any CVC.
4. The app creates deposit and balance amounts dynamically from env/config, so there is no single `STRIPE_PRICE_ID` to maintain.

Stripe sends the customer an email receipt automatically after the deposit checkout. Later, the admin can charge the remaining balance off-session or recover failed charges with a hosted invoice link.

### When you go live

- Swap test keys for live keys in your hosting environment variables.
- Make sure `NEXT_PUBLIC_SITE_URL` is set to your real domain so Stripe redirects work.
- Flip the Stripe dashboard out of test mode.

---

## Meta Conversions API (server-side tracking)

Browser-only Pixel tracking loses 15–30% of events to ad-blockers, iOS privacy, and Safari ITP. The Conversions API sends the same events server-side so Meta can match them and your ad optimisation doesn't go blind.

**How it's wired here**

- Browser Pixel fires `PageView`, `InitiateCheckout`, `Purchase` (components `MetaPixel.tsx`, `PreOrderButton.tsx`, `TrackPurchase.tsx`).
- Server fires the same `InitiateCheckout` from `/api/checkout` and the same `Purchase` from the Stripe webhook at `/api/stripe/webhook`.
- Each event carries a shared `event_id` so Meta dedupes browser + server into a single event:
  - `InitiateCheckout` — a UUID generated client-side, passed through to the server and stored in Stripe session metadata.
  - `Purchase` — the Stripe `session_id`, available on both `/success` (browser) and in the webhook (server).

**Setup (one-time)**

1. **Generate the CAPI access token.** In Meta Events Manager → your pixel → **Settings** → **Conversions API** → **Generate access token**. Paste into `META_CAPI_ACCESS_TOKEN`.
2. **Create the Stripe webhook.** Stripe dashboard → **Developers → Webhooks → Add endpoint**:
   - URL: `https://<your-domain>/api/stripe/webhook`
   - Event to send: `checkout.session.completed`
   - Copy the signing secret (`whsec_...`) into `STRIPE_WEBHOOK_SECRET`.
3. **Test before going live.** In Events Manager → **Test events** tab, grab the `TEST#####` code and drop it into `META_CAPI_TEST_EVENT_CODE`. Events fire into the test view instead of live reporting until you clear that variable.

**Local testing**

```bash
# Forward real Stripe webhooks to localhost while you develop:
stripe listen --forward-to localhost:3000/api/stripe/webhook
# The CLI prints a whsec_... on startup — paste it into STRIPE_WEBHOOK_SECRET.

# In another terminal, trigger a purchase:
stripe trigger checkout.session.completed
```

Then watch:
- **Events Manager → Test events** — you should see `InitiateCheckout` and `Purchase` arrive with `Browser` + `Server` ticked.
- **Meta Pixel Helper** (Chrome extension) — confirms browser events fire with the right values.

**Before running paid traffic**

- The pixel + CAPI currently load unconditionally. For UK/EU paid traffic you should gate both behind a cookie banner so you're ICO/GDPR compliant. Happy to wire a minimal consent banner when you're ready.
- Clear `META_CAPI_TEST_EVENT_CODE` in your production environment so events count as real conversions, not test events.

---

## Editing the offer

All tweakable copy lives in one place: [`lib/config.ts`](lib/config.ts).

```ts
export const PRODUCT = {
  name: 'Daily Fibre',
  pricePence: 2900,
  priceGBP: '£29',
  // ...
};

export const LAUNCH = {
  shipDateLong: 'Monday 18 May 2026',
  shipDateShort: '18 May',
  shipDateISO: '2026-05-18',
  batchSize: 500,
};
```

Change the ship date, batch size, or price values here and they flow through the hero, guarantee panel, FAQ, success page, and admin.

> The deposit and balance amounts are driven by env (`FULL_PRICE_PENCE`, `DEPOSIT_PENCE`, `BALANCE_PENCE`) and surfaced in `config.ts`.

---

## Project structure

```
app/
  layout.tsx              // fonts, metadata, global shell
  page.tsx                // landing page composition
  globals.css             // tailwind + base tokens
  success/page.tsx        // post-payment thank-you page
  admin/                  // password-protected preorder admin
  api/checkout/route.ts   // creates the Stripe deposit Checkout Session
  api/stripe/webhook/route.ts  // Stripe webhook -> DB persistence + balance state sync
components/
  Announcement.tsx
  Nav.tsx
  Hero.tsx
  Pillars.tsx
  HowItWorks.tsx
  Formula.tsx
  Comparison.tsx
  Guarantee.tsx
  FounderNote.tsx
  FAQ.tsx
  EmailCapture.tsx
  Footer.tsx
  StickyCTA.tsx
  PreOrderButton.tsx      // client component; posts to /api/checkout
  ImagePlaceholder.tsx
lib/
  config.ts               // all campaign-level constants
  db.ts                   // Prisma client singleton
  preorder-service.ts     // preorder persistence, balance charging, refunds, recovery emails
  preorders.ts            // shared preorder metadata helpers
  stripe.ts               // server-only Stripe client
  pixel.ts                // typed wrapper around window.fbq (browser Pixel)
  meta-capi.ts            // server-only Conversions API client
prisma/
  schema.prisma           // preorder schema
  migrations/             // SQL migrations
public/
  main-product-image.png  // your existing product shot
```

---

## Design tokens

Defined in [`tailwind.config.ts`](tailwind.config.ts):

- `cream` `#F7F2EC` — background
- `ink` `#2A1C13` — primary text
- `cocoa` `#5A3A29` — brand accent
- `tape` `#E6D8C7` — hairlines, dividers
- `muted` `#8A6A50` — secondary text

Font families:

- `font-serif` — Playfair Display (reserved for the `dump` wordmark and section headlines)
- `font-sans` — Inter (body, UI, everything else)

---

## Placeholders you'll want to replace

- Secondary lifestyle imagery (the "Image placeholder" boxes in *How it works*, *Formula*, and *Founder note*)
- Founder headshot in `FounderNote.tsx`
- Favicon and an OG share image at `public/og-image.png`
- Final ingredient list and nutrition panel (`components/Formula.tsx`)
- Real privacy, terms, and refund policy pages (footer links are stubs to `#`)
- Email capture provider wiring — see TODO in `components/EmailCapture.tsx`
- Contact email address (`SITE.contactEmail` in `lib/config.ts`)

---

## Deploying to Render

1. Push this repo to GitHub.
2. In Render, create a **Web Service** using Node.
3. Add the environment variables from `.env.local.example`, especially `DATABASE_URL`, Stripe secrets, pricing vars, admin password, and Resend credentials.
4. Deploy, then point the Stripe webhook endpoint at `https://<your-domain>/api/stripe/webhook`.

---

## Out of scope for v1

- Subscriptions or bundles (intentionally single SKU)
- Webhook-driven fulfillment automation (Stripe receipts are sufficient for the pre-order batch)
- Multi-country shipping (GB only on first batch)
- CMS — all copy is in React components + `lib/config.ts`
- Reviews widget (nothing to review yet)

Add a `/api/webhook` route later when you wire email marketing (Klaviyo, Mailchimp) or automated shipping tools.

---

## Scripts

```bash
npm run dev     # local dev
npm run build   # production build
npm run start   # serve the production build
npm run lint    # lint
```
