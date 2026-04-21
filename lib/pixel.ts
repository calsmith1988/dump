/**
 * Thin, type-safe wrapper around window.fbq (Meta Pixel).
 *
 * Safe to call before the pixel script has loaded — fbq's own queue will
 * replay the call once ready. If the pixel is blocked entirely (ad-blocker,
 * no consent wrapper, SSR, etc.), this silently no-ops instead of throwing.
 *
 * The optional `eventID` in the third arg is what Meta uses to dedupe a
 * browser event against a matching CAPI (server) event of the same name.
 */

type FbqEventParams = {
  value?: number;
  currency?: string;
  content_name?: string;
  content_ids?: string[];
  content_type?: string;
  num_items?: number;
  [key: string]: unknown;
};

type FbqEventOptions = {
  eventID?: string;
};

declare global {
  interface Window {
    fbq?: (
      command: 'track' | 'trackCustom' | 'init' | 'consent',
      eventOrArg: string,
      params?: FbqEventParams,
      options?: FbqEventOptions,
    ) => void;
  }
}

export function trackEvent(
  event: string,
  params?: FbqEventParams,
  options?: FbqEventOptions,
) {
  if (typeof window === 'undefined') return;
  if (typeof window.fbq !== 'function') return;
  try {
    window.fbq('track', event, params, options);
  } catch {
    // fbq shouldn't throw, but never let tracking break the UX.
  }
}

export function trackCustomEvent(
  event: string,
  params?: FbqEventParams,
  options?: FbqEventOptions,
) {
  if (typeof window === 'undefined') return;
  if (typeof window.fbq !== 'function') return;
  try {
    window.fbq('trackCustom', event, params, options);
  } catch {
    // no-op
  }
}
