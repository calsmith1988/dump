'use client';

import { useEffect, useRef } from 'react';
import { PRODUCT } from '@/lib/config';
import { trackEvent } from '@/lib/pixel';
import { getConsent } from '@/lib/consent';

type Props = {
  sessionId?: string;
};

/**
 * Fires a single Meta `Purchase` event on /success.
 *
 * Uses sessionStorage keyed off the Stripe session_id so that refreshing
 * the thank-you page doesn't double-count the conversion.
 *
 * The Stripe session_id is also passed as Meta's `eventID`, which dedupes
 * this browser event against the server-side Purchase fired from the
 * Stripe webhook (app/api/stripe/webhook) using the same id.
 */
export default function TrackPurchase({ sessionId }: Props) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    // Respect the user's current consent state on this device. The server-side
    // Purchase event (fired from the Stripe webhook) is gated separately based
    // on the consent recorded at the moment of checkout.
    if (!getConsent().ads) return;

    const storageKey = sessionId ? `dump:purchase:${sessionId}` : 'dump:purchase:anon';
    try {
      if (sessionStorage.getItem(storageKey)) return;
      sessionStorage.setItem(storageKey, '1');
    } catch {
      // If storage is unavailable, still fire — better to risk a duplicate
      // than to silently skip the conversion.
    }

    trackEvent(
      'Purchase',
      {
        value: PRODUCT.pricePence / 100,
        currency: 'GBP',
        content_name: PRODUCT.name,
        content_ids: ['daily-fibre-pre-order'],
        content_type: 'product',
        num_items: 1,
      },
      sessionId ? { eventID: sessionId } : undefined,
    );
  }, [sessionId]);

  return null;
}
