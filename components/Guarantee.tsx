import PreOrderButton from './PreOrderButton';
import { LAUNCH, PRODUCT } from '@/lib/config';

const points = [
  {
    title: 'Charge today, reserve your pouch.',
    body: `One of the first ${LAUNCH.batchSize} pouches in the first batch. Locked in the moment you pre-order.`,
  },
  {
    title: `Ships ${LAUNCH.shipDateLong}.`,
    body: 'A real date, not a vague "coming soon". Tracked UK delivery, no surprises.',
  },
  {
    title: 'Full refund if we miss it.',
    body: 'If Daily Fibre isn\'t on its way to you by the ship date, we refund automatically. No forms, no calls, no hoops.',
  },
  {
    title: 'Cancel any time before shipping.',
    body: 'Change your mind before it ships? Email us and we\'ll cancel and refund in full.',
  },
];

export default function Guarantee() {
  return (
    <section aria-labelledby="guarantee-heading" className="py-24 sm:py-32">
      <div className="section">
        <div className="mx-auto max-w-4xl rounded-[14px] border border-tape bg-ink px-6 py-12 text-cream sm:px-12 sm:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-cream/60">
              The pre-order promise
            </p>
            <h2
              id="guarantee-heading"
              className="mt-3 text-balance font-serif text-3xl tracking-tight text-cream sm:text-4xl"
            >
              Pre-ordering should feel safe, not speculative.
            </h2>
            <p className="mx-auto mt-4 max-w-[54ch] text-cream/75">
              We&apos;re building Daily Fibre the right way — and we&apos;d rather lose a sale than lose your trust. Here&apos;s exactly what you&apos;re getting when you pre-order.
            </p>
          </div>

          <ul className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {points.map((p) => (
              <li
                key={p.title}
                className="rounded-[10px] border border-cream/15 bg-cream/5 p-6"
              >
                <p className="font-medium text-cream">{p.title}</p>
                <p className="mt-2 text-sm text-cream/70">{p.body}</p>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-col items-center gap-3">
            <PreOrderButton
              className="!bg-cream !text-ink hover:!bg-tape"
              label={`Pre-order Daily Fibre — ${PRODUCT.priceGBP}`}
            />
            <span className="text-xs text-cream/60">Secure checkout by Stripe · {PRODUCT.shippingCopy}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
