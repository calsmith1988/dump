'use client';

import { useState, type FormEvent } from 'react';

type Status = 'idle' | 'submitting' | 'success' | 'error';

export default function EmailCapture() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('submitting');
    setError(null);

    try {
      // TODO: Wire to Klaviyo / Mailchimp / ConvertKit once chosen.
      // For now we just simulate a successful capture so the UX is complete.
      await new Promise((r) => setTimeout(r, 500));
      setStatus('success');
      setEmail('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong.';
      setError(message);
      setStatus('error');
    }
  }

  return (
    <section aria-labelledby="email-heading" className="border-t border-tape bg-cream">
      <div className="section py-20 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">Not ready yet?</p>
          <h2
            id="email-heading"
            className="mt-3 text-balance font-serif text-3xl tracking-tight text-ink sm:text-4xl"
          >
            Get 10% off when we launch.
          </h2>
          <p className="mx-auto mt-4 max-w-[52ch] text-ink/75">
            One email when it ships. No weekly fluff, no unsubscribe games. Unsubscribe any time.
          </p>

          <form
            onSubmit={onSubmit}
            className="mx-auto mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row"
            noValidate
          >
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@yours.com"
              className="w-full rounded border border-tape bg-cream px-4 py-3.5 text-base text-ink placeholder:text-muted/70 focus:border-cocoa focus:outline-none"
              autoComplete="email"
              disabled={status === 'submitting' || status === 'success'}
            />
            <button
              type="submit"
              className="btn-primary sm:whitespace-nowrap"
              disabled={status === 'submitting' || status === 'success'}
            >
              {status === 'submitting' ? 'Saving…' : status === 'success' ? 'Saved' : 'Keep me posted'}
            </button>
          </form>

          {status === 'success' && (
            <p className="mt-4 text-sm text-cocoa" role="status">
              You&apos;re on the list. We&apos;ll email you when it ships.
            </p>
          )}
          {status === 'error' && error && (
            <p className="mt-4 text-sm text-cocoa" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
