import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { PRODUCT, SITE } from '@/lib/config';
import { sendCapiEvent } from '@/lib/meta-capi';
import {
  persistCompletedCheckoutSession,
  recordStripeWebhookEvent,
  syncBalancePaymentIntentFailed,
  syncBalancePaymentIntentSucceeded,
} from '@/lib/preorder-service';
import { isDepositPreorderMetadata, isTruthyMetadataValue } from '@/lib/preorders';

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
    const isNewEvent = await recordStripeWebhookEvent(event.id, event.type);
    if (!isNewEvent) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await syncBalancePaymentIntentSucceeded(paymentIntent);
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await syncBalancePaymentIntentFailed(paymentIntent);
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
  if (!isDepositPreorderMetadata(session.metadata)) {
    return;
  }

  await persistCompletedCheckoutSession(session);

  // Respect the consent the user gave at the moment they clicked pre-order.
  // It's persisted in session metadata by /api/checkout so this webhook
  // (which runs without any browser context) still has a reliable signal.
  const marketingConsent = isTruthyMetadataValue(session.metadata?.marketing_consent);
  if (!marketingConsent) {
    return;
  }

  const customer = session.customer_details;
  const addressSource = customer?.address ?? null;
  const nameSource = customer?.name ?? '';
  const [firstName, ...rest] = nameSource.trim().split(/\s+/);
  const lastName = rest.join(' ');

  const amountTotalPence = session.amount_total ?? PRODUCT.depositPence;
  const currency = (session.currency ?? 'gbp').toUpperCase();

  await sendCapiEvent({
    eventName: 'Purchase',
    eventId: session.id, // Stripe session_id — matches the browser Purchase on /success.
    eventSourceUrl: `${SITE.url}/success?session_id=${session.id}`,
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
        session.customer && typeof session.customer === 'string'
          ? session.customer
          : null,
    },
    customData: {
      value: amountTotalPence / 100,
      currency,
      content_name: `${PRODUCT.name} deposit`,
      content_ids: [PRODUCT.sku],
      content_type: 'product',
      num_items: 1,
      order_id: session.id,
      full_price_value: PRODUCT.pricePence / 100,
      remaining_balance_value: PRODUCT.balancePence / 100,
    },
  });
}
