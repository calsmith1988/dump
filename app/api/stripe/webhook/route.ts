import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { PRODUCT, SITE } from '@/lib/config';
import { sendCapiEvent } from '@/lib/meta-capi';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Stripe webhook endpoint.
 *
 * Currently handles `checkout.session.completed` to fire a server-side
 * `Purchase` event to Meta CAPI. Uses the Stripe session id as `event_id`
 * so it dedupes with the browser Purchase event fired on /success.
 *
 * Setup:
 * 1. In the Stripe dashboard, Developers → Webhooks → Add endpoint.
 * 2. URL: https://<your-domain>/api/stripe/webhook
 * 3. Event: checkout.session.completed (add payment_intent.succeeded too if you want)
 * 4. Copy the signing secret (starts with `whsec_...`) into STRIPE_WEBHOOK_SECRET.
 *
 * Local testing:
 *   stripe listen --forward-to localhost:3000/api/stripe/webhook
 *   stripe trigger checkout.session.completed
 */
export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('[stripe-webhook] STRIPE_WEBHOOK_SECRET is not set.');
    return NextResponse.json(
      { error: 'Webhook secret not configured.' },
      { status: 500 },
    );
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header.' }, { status: 400 });
  }

  // Signature verification requires the raw body string, not a parsed object.
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Signature verification failed.';
    console.error('[stripe-webhook] Invalid signature:', message);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }
      // Add more event types here as needed (refunds, disputes, etc.)
      default:
        // Ignore events we don't care about — still return 200 so Stripe
        // doesn't retry them.
        break;
    }
  } catch (err) {
    console.error('[stripe-webhook] Handler error', err);
    // Return 500 so Stripe retries — but only for transient failures.
    return NextResponse.json({ error: 'Handler error.' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const checkoutSession = session as Stripe.Checkout.Session & {
    collected_information?: {
      shipping_details?: {
        address?: Stripe.Address | null;
        name?: string | null;
      } | null;
    } | null;
    shipping_details?: {
      address?: Stripe.Address | null;
      name?: string | null;
    } | null;
  };

  // Respect the consent the user gave at the moment they clicked pre-order.
  // It's persisted in session metadata by /api/checkout so this webhook
  // (which runs without any browser context) still has a reliable signal.
  const marketingConsent = checkoutSession.metadata?.marketing_consent === 'true';
  if (!marketingConsent) {
    return;
  }

  const customer = checkoutSession.customer_details;
  // Stripe moved shipping details under collected_information on newer API versions.
  const shipping =
    checkoutSession.collected_information?.shipping_details ??
    // Backwards-compatible fallback for older API versions.
    checkoutSession.shipping_details;

  const addressSource = shipping?.address ?? customer?.address ?? null;
  const nameSource = shipping?.name ?? customer?.name ?? '';
  const [firstName, ...rest] = nameSource.trim().split(/\s+/);
  const lastName = rest.join(' ');

  const amountTotalPence = checkoutSession.amount_total ?? PRODUCT.pricePence;
  const currency = (checkoutSession.currency ?? 'gbp').toUpperCase();

  await sendCapiEvent({
    eventName: 'Purchase',
    eventId: checkoutSession.id, // Stripe session_id — matches the browser Purchase on /success.
    eventSourceUrl: `${SITE.url}/success?session_id=${checkoutSession.id}`,
    actionSource: 'website',
    userData: {
      email: customer?.email ?? null,
      phone: customer?.phone ?? null,
      firstName: firstName || null,
      lastName: lastName || null,
      city: addressSource?.city ?? null,
      postcode: addressSource?.postal_code ?? null,
      country: addressSource?.country ?? null,
      externalId:
        checkoutSession.customer && typeof checkoutSession.customer === 'string'
          ? checkoutSession.customer
          : null,
    },
    customData: {
      value: amountTotalPence / 100,
      currency,
      content_name: PRODUCT.name,
      content_ids: ['daily-fibre-pre-order'],
      content_type: 'product',
      num_items: 1,
      order_id: checkoutSession.id,
    },
  });
}
