import Link from 'next/link';
import { SITE } from '@/lib/config';
import CookiePreferencesLink from '@/components/CookiePreferencesLink';

export default function Footer() {
  return (
    <footer className="border-t border-tape bg-ink text-cream">
      <div className="section grid grid-cols-1 gap-10 py-16 sm:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <p className="wordmark text-3xl text-cream">dump</p>
          <p className="mt-3 max-w-xs text-sm text-cream/70">{SITE.tagline}</p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-cream/50">Company</p>
          <ul className="mt-4 space-y-2 text-sm text-cream/80">
            <li><Link href="#pre-order" className="hover:text-cream">Pre-order</Link></li>
            <li><a href={`mailto:${SITE.contactEmail}`} className="hover:text-cream">Contact</a></li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-cream/50">Legal</p>
          <ul className="mt-4 space-y-2 text-sm text-cream/80">
            <li><Link href="/privacy" className="hover:text-cream">Privacy</Link></li>
            <li><Link href="/terms" className="hover:text-cream">Terms</Link></li>
            <li><Link href="/refunds" className="hover:text-cream">Refund policy</Link></li>
            <li><Link href="/shipping" className="hover:text-cream">Shipping</Link></li>
            <li><Link href="/cookies" className="hover:text-cream">Cookies</Link></li>
            <li><CookiePreferencesLink /></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-cream/10">
        <div className="section flex flex-col items-start justify-between gap-3 py-6 text-xs text-cream/50 sm:flex-row sm:items-center">
          <p>&copy; {new Date().getFullYear()} dump. All rights reserved.</p>
          <p>Not intended to diagnose, treat, cure, or prevent any disease. Speak to your GP if you have concerns.</p>
        </div>
      </div>
    </footer>
  );
}
