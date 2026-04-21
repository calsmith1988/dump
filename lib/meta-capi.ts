import 'server-only';
import { createHash } from 'node:crypto';
import { TRACKING } from '@/lib/config';

/**
 * Meta Conversions API client.
 *
 * Server-side companion to the browser Pixel. Meta dedupes browser + server
 * events using matching `event_name` + `event_id` pairs, so every event fired
 * here should also be fired from the browser with the same event_id.
 *
 * Docs: https://developers.facebook.com/docs/marketing-api/conversions-api
 */

const GRAPH_VERSION = 'v21.0';

type UserDataInput = {
  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  city?: string | null;
  postcode?: string | null;
  country?: string | null;
  clientIp?: string | null;
  clientUserAgent?: string | null;
  fbp?: string | null;
  fbc?: string | null;
  externalId?: string | null;
};

type CustomData = {
  value?: number;
  currency?: string;
  content_name?: string;
  content_ids?: string[];
  content_type?: string;
  num_items?: number;
  order_id?: string;
  [key: string]: unknown;
};

type CapiEvent = {
  eventName: 'InitiateCheckout' | 'Purchase' | 'PageView' | 'Lead' | string;
  eventId: string;
  eventSourceUrl?: string;
  actionSource?:
    | 'website'
    | 'email'
    | 'app'
    | 'phone_call'
    | 'chat'
    | 'physical_store'
    | 'system_generated'
    | 'other';
  userData: UserDataInput;
  customData?: CustomData;
};

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function normaliseEmail(value: string): string {
  return value.trim().toLowerCase();
}

function normalisePhone(value: string): string {
  // Meta wants digits only, country code included.
  return value.replace(/[^\d]/g, '');
}

function normaliseName(value: string): string {
  return value.trim().toLowerCase();
}

function normalisePostcode(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, '');
}

function normaliseCountry(value: string): string {
  // ISO 3166-1 alpha-2, lowercase.
  return value.trim().toLowerCase().slice(0, 2);
}

function hashOrUndefined(value: string | null | undefined, normalise: (v: string) => string): string | undefined {
  if (!value) return undefined;
  const normalised = normalise(value);
  if (!normalised) return undefined;
  return sha256(normalised);
}

function buildUserData(input: UserDataInput): Record<string, unknown> {
  const user: Record<string, unknown> = {};

  const em = hashOrUndefined(input.email, normaliseEmail);
  if (em) user.em = [em];

  const ph = hashOrUndefined(input.phone, normalisePhone);
  if (ph) user.ph = [ph];

  const fn = hashOrUndefined(input.firstName, normaliseName);
  if (fn) user.fn = [fn];

  const ln = hashOrUndefined(input.lastName, normaliseName);
  if (ln) user.ln = [ln];

  const ct = hashOrUndefined(input.city, normaliseName);
  if (ct) user.ct = [ct];

  const zp = hashOrUndefined(input.postcode, normalisePostcode);
  if (zp) user.zp = [zp];

  const country = hashOrUndefined(input.country, normaliseCountry);
  if (country) user.country = [country];

  const externalId = hashOrUndefined(input.externalId, (v) => v.trim());
  if (externalId) user.external_id = [externalId];

  if (input.clientIp) user.client_ip_address = input.clientIp;
  if (input.clientUserAgent) user.client_user_agent = input.clientUserAgent;
  if (input.fbp) user.fbp = input.fbp;
  if (input.fbc) user.fbc = input.fbc;

  return user;
}

/**
 * Fire one event to Meta CAPI. Returns true on success, false on any error
 * (logs server-side). Never throws — tracking must not break business logic.
 */
export async function sendCapiEvent(event: CapiEvent): Promise<boolean> {
  const pixelId = TRACKING.metaPixelId;
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;

  if (!pixelId || !accessToken) {
    // CAPI not configured — browser pixel is still doing its thing. No-op.
    return false;
  }

  const payload: Record<string, unknown> = {
    event_name: event.eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_id: event.eventId,
    action_source: event.actionSource ?? 'website',
    user_data: buildUserData(event.userData),
  };

  if (event.eventSourceUrl) payload.event_source_url = event.eventSourceUrl;
  if (event.customData) payload.custom_data = event.customData;

  const body: Record<string, unknown> = {
    data: [payload],
  };

  const testEventCode = process.env.META_CAPI_TEST_EVENT_CODE;
  if (testEventCode) {
    body.test_event_code = testEventCode;
  }

  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(
    accessToken,
  )}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      // Don't let CAPI hang a serverless function forever.
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error('[meta-capi] Non-2xx response', res.status, text);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[meta-capi] Request failed', err);
    return false;
  }
}

/**
 * Extract the best-effort client IP from a Next.js request.
 * Prefers standard proxy headers (Vercel, most CDNs) and falls back safely.
 */
export function getClientIp(request: Request): string | null {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const first = forwardedFor.split(',')[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return null;
}

/**
 * Pull Meta's `_fbp` and `_fbc` cookies from the request, if present.
 * These massively improve CAPI event matching quality.
 */
export function getFbCookies(request: Request): { fbp: string | null; fbc: string | null } {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return { fbp: null, fbc: null };

  const jar: Record<string, string> = {};
  for (const part of cookieHeader.split(';')) {
    const [rawName, ...rawRest] = part.split('=');
    if (!rawName || rawRest.length === 0) continue;
    const name = rawName.trim();
    const value = rawRest.join('=').trim();
    if (name) jar[name] = decodeURIComponent(value);
  }

  return {
    fbp: jar._fbp ?? null,
    fbc: jar._fbc ?? null,
  };
}
