import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { LAUNCH, PREORDER, PRODUCT, SITE } from '@/lib/config';
import { getClientIp, getFbCookies, sendCapiEvent } from '@/lib/meta-capi';
import { buildPreorderMetadata } from '@/lib/preorders';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type CheckoutRequestBody = {
  eventId?: string;
  marketingConsent?: boolean;
};

export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      {
        error: 'Stripe is not configured yet. Set STRIPE_SECRET_KEY in .env.local.',
      },
      { status: 500 },
    );
  }

  let body: CheckoutRequestBody = {};
  try {
    const text = await request.text();
    body = text ? (JSON.parse(text) as CheckoutRequestBody) : {};
  } catch {
    // Non-JSON body is fine — event_id is optional.
  }

  const clientInitiateEventId = body.eventId;
  const marketingConsent = body.marketingConsent === true;
  const origin = SITE.url;
  const preorderMetadata = buildPreorderMetadata({
    marketingConsent,
    initiateCheckoutEventId: clientInitiateEventId,
  });

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_creation: 'always',
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: `${PRODUCT.name} preorder deposit`,
              description: `Reserve one pouch now. Remaining ${PRODUCT.balanceGBP} charged before dispatch.`,
            },
            unit_amount: PRODUCT.depositPence,
          },
          quantity: 1,
        },
      ],
      shipping_address_collection: { allowed_countries: ['GB'] },
      phone_number_collection: { enabled: true },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#pre-order`,
      metadata: preorderMetadata,
      payment_intent_data: {
        description: `dump Daily Fibre deposit — remaining ${PRODUCT.balanceGBP} before dispatch`,
        setup_future_usage: 'off_session',
        metadata: preorderMetadata,
      },
      custom_text: {
        submit: {
          message: `Pay ${PRODUCT.depositGBP} today to reserve your pouch. We’ll charge the remaining ${PRODUCT.balanceGBP} before dispatch using your saved payment method. Full refund if we miss ${LAUNCH.shipDateShort}.`,
        },
        shipping_address: {
          message: 'Currently shipping to UK addresses only.',
        },
      },
    });

    if (!session.url) {
      return NextResponse.json({ error: 'Failed to create session.' }, { status: 500 });
    }

    // Fire InitiateCheckout server-side. Deduped against the browser event
    // by the shared event_id the client generated before calling this route.
    // Only fires when the user has granted ads consent via the cookie banner.
    // We don't await the send so it can't slow down the redirect.
    if (clientInitiateEventId && marketingConsent) {
      const { fbp, fbc } = getFbCookies(request);
      void sendCapiEvent({
        eventName: 'InitiateCheckout',
        eventId: clientInitiateEventId,
        eventSourceUrl: `${origin}/#pre-order`,
        actionSource: 'website',
        userData: {
          clientIp: getClientIp(request),
          clientUserAgent: request.headers.get('user-agent'),
          fbp,
          fbc,
        },
        customData: {
          value: PRODUCT.depositPence / 100,
          currency: 'GBP',
          content_name: `${PRODUCT.name} deposit`,
          content_ids: [PRODUCT.sku],
          content_type: 'product',
          num_items: 1,
          full_price_value: PRODUCT.pricePence / 100,
          remaining_balance_value: PRODUCT.balancePence / 100,
          balance_collection_mode: PREORDER.balanceCollectionMode,
        },
      });
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
