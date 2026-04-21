import Image from 'next/image';

const whatsOut = [
  'No added sugar',
  'No artificial sweeteners',
  'No gums or fillers',
  'No flavourings',
  'No colours',
  'No caffeine',
];

export default function Formula() {
  return (
    <section
      aria-labelledby="formula-heading"
      className="border-y border-tape bg-tape/25"
    >
      <div className="section py-24 sm:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">The formula</p>
          <h2
            id="formula-heading"
            className="mt-3 text-balance font-serif text-3xl tracking-tight text-ink sm:text-4xl"
          >
            One ingredient. Not glamorous. Very effective.
          </h2>
          <p className="mx-auto mt-4 max-w-[54ch] text-ink/75">
            No sweeteners, no flavour systems, no filler fibres. Just psyllium husk — the fibre most research is actually built on.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-14">
          <div className="order-2 lg:order-1">
            <div className="relative aspect-square w-full overflow-hidden rounded-[10px] border border-tape bg-tape/40">
              <Image
                src="/psyllium-husk.png"
                alt="Psyllium husk — the single ingredient in dump Daily Fibre"
                fill
                sizes="(min-width: 1024px) 45vw, 90vw"
                className="object-cover"
              />
            </div>
          </div>

          <div className="order-1 space-y-10 lg:order-2">
            <div className="rounded-[10px] border border-tape bg-cream p-8 sm:p-10">
              <p className="eyebrow">The ingredient</p>
              <h3 className="wordmark mt-3 text-4xl text-cocoa sm:text-5xl">Psyllium husk</h3>
              <p className="mt-4 max-w-[44ch] text-ink/75">
                A soluble plant fibre from the <em>Plantago ovata</em> plant. It absorbs water, adds bulk, and helps things move — gently and predictably.
              </p>
              <dl className="mt-8 grid grid-cols-2 gap-6 border-t border-tape pt-6 sm:grid-cols-3">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-[0.18em] text-muted">Source</dt>
                  <dd className="mt-1.5 text-sm text-ink">Plant-based</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-[0.18em] text-muted">Type</dt>
                  <dd className="mt-1.5 text-sm text-ink">Soluble fibre</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-[0.18em] text-muted">Form</dt>
                  <dd className="mt-1.5 text-sm text-ink">Milled powder</dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="eyebrow mb-5">What&apos;s not in it</h3>
              <ul className="flex flex-wrap gap-2">
                {whatsOut.map((item) => (
                  <li
                    key={item}
                    className="rounded-full border border-tape bg-cream px-3.5 py-1.5 text-sm text-ink/80"
                  >
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-6 max-w-[52ch] text-sm text-ink/60">
                Final nutritional panel will be confirmed on pack before shipping. The formula itself won&apos;t change: one ingredient, nothing bolted on.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
