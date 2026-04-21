const rows = [
  { label: 'Just fibre — no fillers or gums', them: false, us: true },
  { label: 'Unflavoured, no sweeteners', them: false, us: true },
  { label: 'Simple daily routine', them: true, us: true },
  { label: 'Made in the UK', them: false, us: true },
  { label: 'Refund guarantee on pre-orders', them: false, us: true },
];

function Tick({ on }: { on: boolean }) {
  if (on) {
    return (
      <span
        className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-cocoa text-cream"
        aria-label="Yes"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path
            d="M2 6.5L4.8 9L10 3"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }
  return (
    <span
      className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-tape text-muted"
      aria-label="No"
    >
      <svg width="10" height="2" viewBox="0 0 10 2" fill="none" aria-hidden>
        <path d="M1 1H9" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export default function Comparison() {
  return (
    <section aria-labelledby="compare-heading" className="py-24 sm:py-32">
      <div className="section">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">The difference</p>
          <h2
            id="compare-heading"
            className="mt-3 text-balance font-serif text-3xl tracking-tight text-ink sm:text-4xl"
          >
            Most fibre brands vs. dump.
          </h2>
          <p className="mx-auto mt-4 max-w-[52ch] text-ink/75">
            Most of the category is cluttered, clinical, or aimed at your gran. Daily Fibre is built for people who want something that looks, reads, and works like it&apos;s from this decade.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-3xl overflow-hidden rounded-[10px] border border-tape bg-cream">
          <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-tape bg-tape/40 px-5 py-4 sm:px-8">
            <span className="eyebrow">Feature</span>
            <span className="text-sm font-medium text-muted">Most fibre</span>
            <span className="text-sm font-medium text-cocoa">dump</span>
          </div>
          <ul>
            {rows.map((row, i) => (
              <li
                key={row.label}
                className={`grid grid-cols-[1fr_auto_auto] items-center gap-4 px-5 py-4 sm:px-8 ${
                  i !== rows.length - 1 ? 'border-b border-tape' : ''
                }`}
              >
                <span className="text-sm text-ink sm:text-base">{row.label}</span>
                <span className="flex justify-center"><Tick on={row.them} /></span>
                <span className="flex justify-center"><Tick on={row.us} /></span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
