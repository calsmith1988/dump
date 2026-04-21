'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';
import { TRACKING } from '@/lib/config';
import { getConsent, onConsentChange } from '@/lib/consent';

/**
 * Meta (Facebook) Pixel — consent-gated.
 *
 * The `<Script>` only mounts once the user has granted `ads` consent via
 * the ConsentBanner. Until then no Meta cookies are dropped, no requests
 * are made to connect.facebook.net, and nothing is queued.
 *
 * Fires PageView on initial load after consent. Further events (e.g.
 * InitiateCheckout) are fired via `window.fbq(...)` from other components.
 *
 * Note: we deliberately do not use Meta's Consent Mode (`fbq('consent', ...)`)
 * here because it still loads the script and drops some cookies. Blocking
 * the script entirely is the stricter and simpler ICO-friendly default.
 */
export default function MetaPixel() {
  const pixelId = TRACKING.metaPixelId;
  const [adsConsent, setAdsConsent] = useState(false);

  useEffect(() => {
    setAdsConsent(getConsent().ads);
    return onConsentChange((state) => setAdsConsent(state.ads));
  }, []);

  if (!pixelId || !adsConsent) return null;

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${pixelId}');
fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
