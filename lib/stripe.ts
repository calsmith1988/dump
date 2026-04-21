import 'server-only';
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  // Soft warning so `next build` doesn't crash before you've wired your keys.
  // The checkout route will return a 500 if this isn't set when a request comes in.
  // eslint-disable-next-line no-console
  console.warn('[stripe] STRIPE_SECRET_KEY is not set. /api/checkout will return 500 until it is.');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_test_placeholder', {
  apiVersion: '2024-06-20',
  typescript: true,
  appInfo: {
    name: 'dump-landing',
    version: '0.1.0',
  },
});
