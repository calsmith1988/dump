'use client';

import { resetConsent } from '@/lib/consent';

/**
 * Small button styled like a footer link.
 *
 * Clears the stored consent decision, which causes the ConsentBanner to
 * reappear so the user can choose again. Required for ICO compliance —
 * users must be able to change their mind as easily as they consented.
 */
export default function CookiePreferencesLink({ className = '' }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        resetConsent();
        // Scroll to top so the banner at the bottom of the viewport is
        // obviously in focus after they click.
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }}
      className={`text-left hover:text-cream ${className}`}
    >
      Cookie preferences
    </button>
  );
}
