const pillars = [
  {
    title: 'Relief',
    body: 'Feel lighter and less weighed down, without the harshness.',
  },
  {
    title: 'Release',
    body: 'Gentle, reliable movement when things feel stuck.',
  },
  {
    title: 'Regularity',
    body: 'Build a smoother, more predictable bathroom routine.',
  },
];

export default function Pillars() {
  return (
    <section aria-labelledby="pillars-heading" className="border-y border-tape bg-cream">
      <div className="section py-16 sm:py-20">
        <h2 id="pillars-heading" className="sr-only">
          What Daily Fibre is built around
        </h2>
        <ul className="grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-6">
          {pillars.map((pillar) => (
            <li key={pillar.title} className="text-center">
              <p className="wordmark text-3xl text-cocoa sm:text-4xl">{pillar.title}</p>
              <p className="mx-auto mt-3 max-w-[28ch] text-base text-ink/75">{pillar.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
