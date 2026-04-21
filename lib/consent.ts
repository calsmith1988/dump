/**
 * Client-side cookie consent state.
 *
 * Stores a single record in localStorage plus a tiny pub/sub so any component
 * can react to changes (e.g. the Meta Pixel mounting/unmounting, the footer
 * preferences link flipping, etc.).
 *
 * ICO/GDPR note: non-essential tracking (ads, analytics) must default to
 * OFF until the user has actively accepted. Never call setConsent(...) on
 * page load to "default them in".
 */

export type ConsentState = {
  /** Analytics-style tracking (e.g. Google Analytics). */
  analytics: boolean;
  /** Ad measurement + retargeting (Meta Pixel, Google Ads, etc.). */
  ads: boolean;
  /** Whether the user has made an explicit choice yet. */
  decided: boolean;
  /** When the decision was recorded. */
  timestamp: number;
  /** Bumped when the consent shape changes — forces the banner to re-ask. */
  version: number;
};

const STORAGE_KEY = 'dump-consent';
const CHANGE_EVENT = 'dump:consent-change';
const CURRENT_VERSION = 1;

const defaultState: ConsentState = {
  analytics: false,
  ads: false,
  decided: false,
  timestamp: 0,
  version: CURRENT_VERSION,
};

export function getConsent(): ConsentState {
  if (typeof window === 'undefined') return defaultState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as ConsentState;
    if (parsed?.version !== CURRENT_VERSION) return defaultState;
    return parsed;
  } catch {
    return defaultState;
  }
}

function broadcast(state: ConsentState) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<ConsentState>(CHANGE_EVENT, { detail: state }));
}

export function setConsent(
  next: Partial<Pick<ConsentState, 'analytics' | 'ads'>>,
): ConsentState {
  const current = getConsent();
  const merged: ConsentState = {
    ...current,
    ...next,
    decided: true,
    timestamp: Date.now(),
    version: CURRENT_VERSION,
  };

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch {
    // If localStorage is unavailable (private browsing, etc.), we still
    // fire the event so in-memory state updates for the current session.
  }

  broadcast(merged);
  return merged;
}

export function acceptAll(): ConsentState {
  return setConsent({ analytics: true, ads: true });
}

export function rejectAll(): ConsentState {
  return setConsent({ analytics: false, ads: false });
}

export function resetConsent(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  broadcast(defaultState);
}

export function onConsentChange(cb: (state: ConsentState) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = (e: Event) => cb((e as CustomEvent<ConsentState>).detail);
  window.addEventListener(CHANGE_EVENT, handler);
  return () => window.removeEventListener(CHANGE_EVENT, handler);
}
