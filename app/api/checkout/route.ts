import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { LAUNCH, PRODUCT, SITE } from '@/lib/config';
import { getClientIp, getFbCookies, sendCapiEvent } from '@/lib/meta-capi';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type CheckoutRequestBody = {
  eventId?: string;
  marketingConsent?: boolean;
};

export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PRICE_ID) {
    return NextResponse.json(
      {
        error:
          'Stripe is not configured yet. Set STRIPE_SECRET_KEY and STRIPE_PRICE_ID in .env.local.',
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
  const origin = request.headers.get('origin') || SITE.url;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      shipping_address_collection: { allowed_countries: ['GB'] },
      phone_number_collection: { enabled: true },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#pre-order`,
      payment_intent_data: {
        description: `dump Daily Fibre — pre-order, ships ${LAUNCH.shipDateLong}`,
        metadata: {
          launch: 'daily-fibre-pre-order',
          ship_date: LAUNCH.shipDateISO,
          marketing_consent: marketingConsent ? 'true' : 'false',
          ...(clientInitiateEventId
            ? { initiate_checkout_event_id: clientInitiateEventId }
            : {}),
        },
      },
      metadata: {
        launch: 'daily-fibre-pre-order',
        ship_date: LAUNCH.shipDateISO,
        marketing_consent: marketingConsent ? 'true' : 'false',
        ...(clientInitiateEventId
          ? { initiate_checkout_event_id: clientInitiateEventId }
          : {}),
      },
      custom_text: {
        submit: {
          message: `You're reserving one pouch of Daily Fibre. Ships ${LAUNCH.shipDateLong}. Full refund if we miss it.`,
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
          value: PRODUCT.pricePence / 100,
          currency: 'GBP',
          content_name: PRODUCT.name,
          content_ids: ['daily-fibre-pre-order'],
          content_type: 'product',
          num_items: 1,
        },
      });
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
