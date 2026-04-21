import Link from 'next/link';
import { SITE } from '@/lib/config';

type Props = {
  title: string;
  intro: string;
  lastUpdated: string;
  children: React.ReactNode;
};

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-tape pt-8 sm:pt-10">
      <h2 className="font-serif text-2xl tracking-tight text-ink sm:text-3xl">
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-sm leading-7 text-ink/80 sm:text-base">
        {children}
      </div>
    </section>
  );
}

export default function LegalPageLayout({
  title,
  intro,
  lastUpdated,
  children,
}: Props) {
  return (
    <main className="min-h-screen bg-cream">
      <div className="section py-14 sm:py-20">
        <Link href="/" className="wordmark text-3xl text-cocoa">
          {SITE.name}
        </Link>
        <div className="mt-10 max-w-4xl">
          <p className="eyebrow">Legal</p>
          <h1 className="mt-3 max-w-3xl text-balance font-serif text-4xl tracking-tight text-ink sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-ink/75 sm:text-lg">
            {intro}
          </p>
          <p className="mt-4 text-sm text-muted">Last updated: {lastUpdated}</p>
        </div>

        <div className="mt-12 max-w-4xl space-y-8">{children}</div>

        <div className="mt-12 border-t border-tape pt-6">
          <Link href="/" className="text-sm text-cocoa underline underline-offset-4">
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
