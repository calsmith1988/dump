import { LAUNCH, PRODUCT, SITE } from '@/lib/config';

const faqs = [
  {
    q: 'Why are you taking pre-orders?',
    a: `We wanted to make Daily Fibre properly rather than rush a launch. Pre-orders let us commit to the first batch of ${LAUNCH.batchSize} pouches and ship on a real date instead of a vague one. You\u2019re reserving one of those pouches now.`,
  },
  {
    q: 'When will it actually ship?',
    a: `${LAUNCH.shipDateLong}. It\u2019s in the calendar. If we miss it for any reason, you get a full refund automatically \u2014 no form, no email chain.`,
  },
  {
    q: 'What if you\u2019re delayed?',
    a: 'Then we refund you in full before the original ship date passes. We\u2019d rather return your money than make you chase it.',
  },
  {
    q: 'Can I cancel before it ships?',
    a: `Yes. Email ${SITE.contactEmail} any time before ${LAUNCH.shipDateLong} and we\u2019ll cancel and refund you in full.`,
  },
  {
    q: 'What\u2019s actually in it?',
    a: 'One ingredient: psyllium husk. That\u2019s the whole list. No sugar, no sweeteners, no gums, no flavour systems, no filler fibres. Final nutritional panel confirmed on pack before shipping.',
  },
  {
    q: 'What does it taste like?',
    a: 'Unflavoured. Not fancy. Best taken quickly. Worth it for what comes after.',
  },
  {
    q: 'How big is the pouch?',
    a: `${PRODUCT.netWeightGrams}g per pouch. One ${PRODUCT.servingSizeGrams}g scoop a day gets you around ${PRODUCT.servings} servings \u2014 close to two months per pouch.`,
  },
  {
    q: 'Is it safe to take every day?',
    a: 'Daily Fibre is designed for regular daily use. If you\u2019re pregnant, breastfeeding, on medication, or managing a gut condition, check with your doctor first \u2014 same as with any supplement.',
  },
  {
    q: 'Do you ship outside the UK?',
    a: 'Not yet. The first batch is UK-only so we can make sure delivery is clean and fast. International is on the roadmap.',
  },
  {
    q: `How much is ${PRODUCT.name}?`,
    a: `${PRODUCT.priceGBP} for a ${PRODUCT.servings}-serving pouch, with ${PRODUCT.shippingCopy.toLowerCase()}. That\u2019s your locked-in pre-order price.`,
  },
];

export default function FAQ() {
  return (
    <section aria-labelledby="faq-heading" className="py-24 sm:py-32">
      <div className="section">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">Questions, plainly answered</p>
          <h2
            id="faq-heading"
            className="mt-3 text-balance font-serif text-3xl tracking-tight text-ink sm:text-4xl"
          >
            Everything you might be wondering.
          </h2>
        </div>

        <div className="mx-auto mt-12 max-w-3xl divide-y divide-tape border-y border-tape">
          {faqs.map((item, i) => (
            <details key={item.q} className="group" {...(i === 0 ? { open: true } : {})}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left marker:hidden">
                <span className="text-base font-medium text-ink sm:text-lg">{item.q}</span>
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-tape text-muted transition-transform group-open:rotate-45"
                  aria-hidden
                >
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                    <path
                      d="M5.5 1V10M1 5.5H10"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </summary>
              <div className="pb-6 pr-12 text-ink/75">{item.a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
