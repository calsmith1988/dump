/**
 * Central place for things you'll want to tweak without hunting through components.
 * Keep this list short. Anything set here is fair game to change per-campaign.
 */

export const SITE = {
  name: 'dump',
  tagline: 'Everyone does it. We make it easier.',
  description:
    'Daily Fibre by dump. Support for smoother mornings, less bloat, and more regular days. Plant-based, no sugar, made in the UK.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  contactEmail: 'calum@dumpdaily.co.uk',
};

export const PRODUCT = {
  name: 'Daily Fibre',
  promise: 'Everyone does it. We make it easier.',
  netWeightGrams: 250,
  servingSizeGrams: 5,
  servings: 50,
  pricePence: 2900,
  priceGBP: '£29',
  shippingCopy: 'Free UK shipping',
};

export const LAUNCH = {
  shipDateLong: 'Monday 18 May 2026',
  shipDateShort: '18 May',
  shipDateISO: '2026-05-18',
  batchSize: 500,
};

export const GUARANTEE = {
  headline: "If we miss 18 May, you get a full refund. No forms, no calls.",
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
