/**
 * Central place for things you'll want to tweak without hunting through components.
 * Keep this list short. Anything set here is fair game to change per-campaign.
 */

function readIntEnv(name: string, fallback: number) {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed)) {
    throw new Error(`${name} must be a whole number in pence.`);
  }
  return parsed;
}

function formatGBPFromPence(pence: number) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(pence / 100);
}

const FULL_PRICE_PENCE = readIntEnv('FULL_PRICE_PENCE', 2900);
const DEPOSIT_PENCE = readIntEnv('DEPOSIT_PENCE', 100);
const BALANCE_PENCE = readIntEnv('BALANCE_PENCE', FULL_PRICE_PENCE - DEPOSIT_PENCE);

if (DEPOSIT_PENCE <= 0) {
  throw new Error('DEPOSIT_PENCE must be greater than zero.');
}

if (BALANCE_PENCE < 0) {
  throw new Error('BALANCE_PENCE must be zero or greater.');
}

if (FULL_PRICE_PENCE !== DEPOSIT_PENCE + BALANCE_PENCE) {
  throw new Error('FULL_PRICE_PENCE must equal DEPOSIT_PENCE + BALANCE_PENCE.');
}

export const SITE = {
  name: 'dump',
  tagline: 'Everyone does it. We make it easier.',
  description:
    'Daily Fibre by dump. Support for smoother mornings, less bloat, and more regular days. Plant-based, no sugar, made in the UK.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  contactEmail: 'hey@trydump.co',
};

export const PRODUCT = {
  sku: 'daily-fibre-250g',
  name: 'Daily Fibre',
  promise: 'Everyone does it. We make it easier.',
  netWeightGrams: 250,
  servingSizeGrams: 5,
  servings: 50,
  pricePence: FULL_PRICE_PENCE,
  priceGBP: formatGBPFromPence(FULL_PRICE_PENCE),
  depositPence: DEPOSIT_PENCE,
  depositGBP: formatGBPFromPence(DEPOSIT_PENCE),
  balancePence: BALANCE_PENCE,
  balanceGBP: formatGBPFromPence(BALANCE_PENCE),
  shippingCopy: 'Free UK shipping',
};

export const LAUNCH = {
  shipDateLong: 'Monday 29 June 2026',
  shipDateShort: '29 June',
  shipDateISO: '2026-06-29',
  batchSize: 500,
};

export const PREORDER = {
  termsVersion: '2026-04-22',
  balanceCollectionMode: (
    process.env.BALANCE_COLLECTION_MODE === 'invoice' ? 'invoice' : 'payment_intent'
  ) as 'invoice' | 'payment_intent',
};

export const GUARANTEE = {
  headline: "If we miss 29 June, you get a full refund. No forms, no calls.",
  days: 30,
};

export const COMPANY = {
  legalName: 'CJS Global LTD',
  companyNumber: '10664657',
  registeredAddress: [
    '8 Henfron',
    'Caerphilly',
    'CF83 2NU',
    'United Kingdom',
  ],
  jurisdiction: 'England and Wales',
};

export const TRACKING = {
  metaPixelId: '1714007130011928',
};

export const EMAIL = {
  from: process.env.RESEND_FROM_EMAIL || 'dump <orders@trydump.co>',
};
