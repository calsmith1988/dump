import Image from 'next/image';
import PreOrderButton from './PreOrderButton';
import { LAUNCH, PRODUCT } from '@/lib/config';

const chips = [
  'Plant-based',
  'No sugar',
  `Refund if we miss ${LAUNCH.shipDateShort}`,
];

export default function Hero() {
  return (
    <section id="pre-order" className="relative overflow-hidden pt-14 sm:pt-20 lg:pt-24">
      <div className="section grid grid-cols-1 items-center gap-12 pb-20 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:pb-28">
        <div className="max-w-prose">
          <p className="eyebrow mb-6">Daily Fibre · Pre-order</p>

          <h1 className="text-balance font-serif text-[44px] leading-[1.02] tracking-tightest text-ink sm:text-[60px] lg:text-[72px]">
            Everyone does it.
            <br />
            <span className="text-cocoa">We make it easier.</span>
          </h1>

          <p className="mt-6 max-w-[48ch] text-balance text-base leading-relaxed text-ink/80 sm:text-lg">
            {PRODUCT.name}. Straightforward support for smoother mornings and more regular days. Plant-based. No sugar. No faff.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <PreOrderButton />
            <span className="text-sm text-muted">
              Ships {LAUNCH.shipDateLong}. We&apos;ll charge the remaining {PRODUCT.balanceGBP} before dispatch. Cancel any time before that happens.
            </span>
          </div>

          <ul className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
            {chips.map((chip) => (
              <li key={chip} className="chip">
                <span className="h-1 w-1 rounded-full bg-muted/60" aria-hidden />
                {chip}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-[640px]">
            <Image
              src="/main-product-image-nobg-v2.png"
              alt="dump Daily Fibre — matte cocoa-brown pouch"
              fill
              priority
              sizes="(min-width: 1024px) 640px, (min-width: 640px) 90vw, 100vw"
              className="object-contain scale-[1.4] sm:scale-[1.5]"
            />
          </div>
          <div className="pointer-events-none absolute -bottom-6 left-1/2 h-10 w-[70%] -translate-x-1/2 rounded-full bg-ink/5 blur-2xl" aria-hidden />
        </div>
      </div>
    </section>
  );
}
