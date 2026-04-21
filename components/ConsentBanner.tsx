'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { acceptAll, getConsent, onConsentChange, rejectAll } from '@/lib/consent';

/**
 * Cookie consent banner.
 *
 * Appears at the bottom of the viewport until the user has made a choice.
 * Accept / Reject are given equal prominence (ICO requirement) and there's
 * no "X to close" or timed dismiss — silence is not consent.
 *
 * Once the user decides, the banner disappears and `localStorage` remembers
 * the choice. They can reopen it via the "Cookie preferences" link in the
 * footer (see `components/Footer.tsx`), which calls `resetConsent()`.
 */
export default function ConsentBanner() {
  const [mounted, setMounted] = useState(false);
  const [decided, setDecided] = useState(true);

  useEffect(() => {
    setMounted(true);
    setDecided(getConsent().decided);
    return onConsentChange((state) => setDecided(state.decided));
  }, []);

  // Don't render server-side or before we've hydrated the stored decision —
  // avoids a flash of banner for returning visitors who already chose.
  if (!mounted || decided) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="consent-banner-title"
      aria-describedby="consent-banner-body"
      className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4 sm:px-6 sm:pb-6"
    >
      <div className="mx-auto max-w-content rounded-[12px] border border-tape bg-cream p-5 shadow-soft sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
          <div className="sm:max-w-[62ch]">
            <p
              id="consent-banner-title"
              className="text-xs font-medium uppercase tracking-[0.18em] text-muted"
            >
              Cookies
            </p>
            <p id="consent-banner-body" className="mt-2 text-sm text-ink/80">
              We use cookies to make the site work, understand how people use it, and measure which
              ads bring visitors here. You can change your mind any time — see our{' '}
              <Link
                href="/cookies"
                className="underline decoration-tape underline-offset-4 hover:text-cocoa"
              >
                cookie policy
              </Link>
              .
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-shrink-0">
            <button
              type="button"
              onClick={() => rejectAll()}
              className="btn-secondary"
              aria-label="Reject non-essential cookies"
            >
              Reject non-essential
            </button>
            <button
              type="button"
              onClick={() => acceptAll()}
              className="btn-primary"
              aria-label="Accept all cookies"
            >
              Accept all
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
