import Link from 'next/link';

export default function Nav() {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-tape/60 bg-cream/85 backdrop-blur supports-[backdrop-filter]:bg-cream/70">
      <div className="section flex items-center justify-between py-4 sm:py-5">
        <Link
          href="/"
          aria-label="dump — home"
          className="wordmark text-2xl leading-none text-cocoa sm:text-3xl"
        >
          dump
        </Link>
        <nav aria-label="Primary">
          <a
            href="#pre-order"
            className="inline-flex items-center gap-2 rounded border border-ink/90 bg-ink px-4 py-2 text-sm font-medium text-cream transition-colors hover:bg-cocoa hover:border-cocoa"
          >
            Pay deposit
          </a>
        </nav>
      </div>
    </header>
  );
}
