import Link from 'next/link';
import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { loginAction } from '@/app/admin/actions';

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminLoginPage({ searchParams }: Props) {
  if (await isAdminAuthenticated()) {
    redirect('/admin');
  }

  const { error } = await searchParams;

  return (
    <main className="min-h-screen bg-cream">
      <div className="section flex min-h-screen items-center justify-center py-16">
        <div className="w-full max-w-md rounded-[14px] border border-tape bg-white p-8 shadow-soft">
          <Link href="/" className="wordmark text-3xl text-cocoa">
            dump
          </Link>
          <p className="eyebrow mt-8">Admin</p>
          <h1 className="mt-3 font-serif text-3xl tracking-tight text-ink">
            Sign in to manage preorders
          </h1>
          <p className="mt-3 text-sm text-ink/75">
            This v1 admin area is protected by a single password stored in your environment.
          </p>

          <form action={loginAction} className="mt-8 space-y-4">
            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-ink">
                Admin password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full rounded border border-tape bg-cream px-4 py-3 text-base text-ink focus:border-cocoa focus:outline-none"
              />
            </div>
            {error ? (
              <p className="text-sm text-cocoa" role="alert">
                That password didn&apos;t match. Try again.
              </p>
            ) : null}
            <button type="submit" className="btn-primary w-full">
              Sign in
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
