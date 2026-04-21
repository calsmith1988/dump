'use client';

import { useState } from 'react';
import { PRODUCT } from '@/lib/config';
import { trackEvent } from '@/lib/pixel';
import { getConsent } from '@/lib/consent';

type Props = {
  label?: string;
  variant?: 'primary' | 'secondary';
  className?: string;
  fullWidth?: boolean;
};

export default function PreOrderButton({
  label,
  variant = 'primary',
  className = '',
  fullWidth = false,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buttonLabel = label ?? `Pre-order — ${PRODUCT.priceGBP}`;

  async function handleClick() {
    setLoading(true);
    setError(null);

    const consent = getConsent();
    const adsConsent = consent.ads;

    // Shared event_id: browser Pixel + server CAPI fire the same InitiateCheckout
    // with this id, and Meta dedupes them into a single event.
    const eventId =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `ic-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    if (adsConsent) {
      trackEvent(
        'InitiateCheckout',
        {
          value: PRODUCT.pricePence / 100,
          currency: 'GBP',
          content_name: PRODUCT.name,
          content_ids: ['daily-fibre-pre-order'],
          content_type: 'product',
          num_items: 1,
        },
        { eventID: eventId },
      );
    }

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, marketingConsent: adsConsent }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Unable to start checkout.');
      }
      window.location.href = data.url;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong.';
      setError(message);
      setLoading(false);
    }
  }

  const base = variant === 'primary' ? 'btn-primary' : 'btn-secondary';

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={`${base} ${fullWidth ? 'w-full' : ''} ${className}`}
        aria-busy={loading}
      >
        {loading ? 'Opening secure checkout…' : buttonLabel}
      </button>
      {error && (
        <p className="mt-3 text-sm text-cocoa" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
