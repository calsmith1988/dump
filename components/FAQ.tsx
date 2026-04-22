import { LAUNCH, PRODUCT, SITE } from '@/lib/config';

const faqs = [
  {
    q: 'Why are you taking pre-orders?',
    a: `We wanted to make ${PRODUCT.name} properly rather than rush a launch. Paying a ${PRODUCT.depositGBP} deposit lets us commit to the first batch of ${LAUNCH.batchSize} pouches and ship on a real date instead of a vague one.`,
  },
  {
    q: 'When will it actually ship?',
    a: `${LAUNCH.shipDateLong}. It’s in the calendar. We’ll charge the remaining ${PRODUCT.balanceGBP} before dispatch using your saved payment method. If we miss it for any reason, you get a full refund automatically — no form, no email chain.`,
  },
  {
    q: 'What if you’re delayed?',
    a: 'Then we refund you in full before the original ship date passes. We’d rather return your money than make you chase it.',
  },
  {
    q: 'Can I cancel before the balance is charged?',
    a: `Yes. Email ${SITE.contactEmail} any time before the final payment runs and we’ll cancel and refund your ${PRODUCT.depositGBP} deposit in full.`,
  },
  {
    q: 'What happens after I pay the deposit?',
    a: `Your pouch is reserved. We save your payment method securely with Stripe, then charge the remaining ${PRODUCT.balanceGBP} before dispatch. If that charge fails, we’ll email you a payment link instead.`,
  },
  {
    q: 'What’s actually in it?',
    a: 'One ingredient: psyllium husk. That’s the whole list. No sugar, no sweeteners, no gums, no flavour systems, no filler fibres. Final nutritional panel confirmed on pack before shipping.',
  },
  {
    q: 'What does it taste like?',
    a: 'Unflavoured. Not fancy. Best taken quickly. Worth it for what comes after.',
  },
  {
    q: 'How big is the pouch?',
    a: `${PRODUCT.netWeightGrams}g per pouch. One ${PRODUCT.servingSizeGrams}g scoop a day gets you around ${PRODUCT.servings} servings — close to two months per pouch.`,
  },
  {
    q: 'Is it safe to take every day?',
    a: 'Daily Fibre is designed for regular daily use. If you’re pregnant, breastfeeding, on medication, or managing a gut condition, check with your doctor first — same as with any supplement.',
  },
  {
    q: 'Do you ship outside the UK?',
    a: 'Not yet. The first batch is UK-only so we can make sure delivery is clean and fast. International is on the roadmap.',
  },
  {
    q: `How much is ${PRODUCT.name}?`,
    a: `${PRODUCT.priceGBP} in total for a ${PRODUCT.servings}-serving pouch, with ${PRODUCT.shippingCopy.toLowerCase()}. You pay ${PRODUCT.depositGBP} today, then the remaining ${PRODUCT.balanceGBP} before dispatch.`,
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
