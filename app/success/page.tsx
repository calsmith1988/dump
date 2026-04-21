import type { Metadata } from 'next';
import Link from 'next/link';
import { LAUNCH, PRODUCT, SITE } from '@/lib/config';
import TrackPurchase from '@/components/TrackPurchase';

export const metadata: Metadata = {
  title: 'You\u2019re in — thanks for pre-ordering',
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ session_id?: string }>;
};

export default async function SuccessPage({ searchParams }: Props) {
  const { session_id: sessionId } = await searchParams;

  return (
    <main className="min-h-screen bg-cream">
      <TrackPurchase sessionId={sessionId} />
      <div className="section flex min-h-screen flex-col items-center justify-center py-20 text-center">
        <Link href="/" aria-label="dump — home" className="wordmark text-3xl text-cocoa">
          dump
        </Link>

        <p className="eyebrow mt-12">Pre-order confirmed</p>
        <h1 className="mt-4 max-w-[22ch] text-balance font-serif text-4xl leading-[1.05] tracking-tight text-ink sm:text-5xl">
          You&apos;re in. Thanks for backing {PRODUCT.name}.
        </h1>
        <p className="mx-auto mt-5 max-w-[52ch] text-ink/75">
          Your pouch is reserved from the first batch. We&apos;ll send tracking the moment it&apos;s on its way.
        </p>

        <div className="mt-10 w-full max-w-2xl rounded-[12px] border border-tape bg-cream text-left">
          <div className="grid grid-cols-1 divide-y divide-tape sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <div className="p-6">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">Ship date</p>
              <p className="mt-2 font-medium text-ink">{LAUNCH.shipDateLong}</p>
            </div>
            <div className="p-6">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">Guarantee</p>
              <p className="mt-2 font-medium text-ink">Full refund if we miss it</p>
            </div>
            <div className="p-6">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">Receipt</p>
              <p className="mt-2 font-medium text-ink">Check your inbox from Stripe</p>
            </div>
          </div>
        </div>

        <div className="mt-10 max-w-prose text-sm text-ink/70">
          <p>
            Anything at all, reply to your Stripe receipt or email{' '}
            <a className="underline decoration-tape underline-offset-4 hover:text-cocoa" href={`mailto:${SITE.contactEmail}`}>
              {SITE.contactEmail}
            </a>
            . We read everything.
          </p>
        </div>

        <Link
          href="/"
          className="btn-secondary mt-10"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
