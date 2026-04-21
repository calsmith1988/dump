import Image from 'next/image';

const steps = [
  {
    n: '01',
    title: 'Mix',
    body: 'One scoop into water. Stir and drink straight away.',
    image: '/1-howitworks.png',
    alt: 'A scoop of psyllium husk being added to a glass of water',
  },
  {
    n: '02',
    title: 'Drink',
    body: 'Unflavoured and simple. Easy to slot into your morning or evening.',
    image: '/2-howitworks-v2.png',
    alt: 'A glass of water with dump Daily Fibre stirred in',
  },
  {
    n: '03',
    title: 'Go',
    body: 'Daily fibre supports smoother, more regular movement — usually within a few days.',
    image: '/3-howitworks.png',
    alt: 'A calm, minimal image representing regularity and relief',
  },
];

export default function HowItWorks() {
  return (
    <section aria-labelledby="how-heading" className="py-24 sm:py-32">
      <div className="section">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">How it fits in</p>
          <h2
            id="how-heading"
            className="mt-3 text-balance font-serif text-3xl tracking-tight text-ink sm:text-4xl"
          >
            Three steps. Then get on with your day.
          </h2>
          <p className="mx-auto mt-4 max-w-[52ch] text-ink/75">
            Daily Fibre is built to sit quietly in your morning. Not fancy. Not fruity. Just straightforward daily fibre.
          </p>
        </div>

        <ol className="mt-14 grid grid-cols-1 gap-8 md:mt-20 md:grid-cols-3 md:gap-10">
          {steps.map((step) => (
            <li key={step.n} className="flex flex-col">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[10px] border border-tape bg-tape/40">
                <Image
                  src={step.image}
                  alt={step.alt}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="mt-5 flex items-baseline gap-4">
                <span className="text-sm font-medium tracking-[0.22em] text-muted">{step.n}</span>
                <h3 className="wordmark text-2xl text-cocoa">{step.title}</h3>
              </div>
              <p className="mt-2 max-w-[40ch] text-ink/75">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
