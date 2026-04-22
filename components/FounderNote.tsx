import Image from 'next/image';

export default function FounderNote() {
  return (
    <section
      aria-labelledby="founder-heading"
      className="border-y border-tape bg-tape/25"
    >
      <div className="section py-24 sm:py-32">
        <div className="mx-auto grid max-w-4xl grid-cols-1 items-start gap-10 md:grid-cols-[200px_1fr] md:gap-14">
          <div className="mx-auto w-40 md:mx-0 md:w-full">
            <div className="relative aspect-square overflow-hidden rounded-full border border-tape bg-cream">
              <Image
                src="/me.jpg"
                alt="Founder of dump"
                fill
                sizes="(min-width: 768px) 200px, 160px"
                className="object-cover"
              />
            </div>
          </div>

          <div>
            <p className="eyebrow">A note from the founder</p>
            <h2
              id="founder-heading"
              className="mt-3 text-balance font-serif text-2xl leading-snug tracking-tight text-ink sm:text-3xl"
            >
              &ldquo;I built dump because every fibre product I tried either looked like it was from 1994, was padded with sweeteners and fillers, or spoke to me like I was fragile.&rdquo;
            </h2>
            <div className="mt-6 space-y-4 text-ink/75">
              <p>
                Feeling backed up or sluggish isn&apos;t a niche problem. Almost everyone has it at some point. And almost every brand in the aisle treats it like something to whisper about.
              </p>
              <p>
                Daily Fibre is the product I wanted to buy — a plain, confident, plant-based daily fibre that does its job, fits quietly into your day, and doesn&apos;t make you feel weird about why you&apos;re buying it.
              </p>
              <p>
                Pre-ordering genuinely helps us get it made. If for any reason we don&apos;t ship on time, you get your money back automatically. That&apos;s the deal.
              </p>
            </div>
            <p className="mt-6 text-sm text-muted">Founder — dump</p>
          </div>
        </div>
      </div>
    </section>
  );
}
