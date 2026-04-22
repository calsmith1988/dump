import type { PreorderStatus } from '@prisma/client';
import Link from 'next/link';
import { db } from '@/lib/db';
import { PRODUCT } from '@/lib/config';
import { requireAdminAuth } from '@/lib/admin-auth';
import {
  bulkChargeRemainingAction,
  chargeRemainingBalanceAction,
  logoutAction,
  refundDepositAction,
  refundOrderAction,
} from '@/app/admin/actions';

type Props = {
  searchParams: Promise<{ status?: string; notice?: string }>;
};

const statuses: PreorderStatus[] = [
  'deposit_paid',
  'balance_pending',
  'balance_succeeded',
  'balance_failed',
  'cancelled',
  'refunded',
];

const gbpFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

function formatPence(pence: number) {
  return gbpFormatter.format(pence / 100);
}

function formatDate(value: Date | null) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value);
}

function canAttemptBalanceCharge(status: PreorderStatus) {
  return status === 'deposit_paid' || status === 'balance_failed';
}

function canRefundDeposit(status: PreorderStatus) {
  return status === 'deposit_paid' || status === 'balance_failed';
}

function canRefundOrder(status: PreorderStatus) {
  return status === 'balance_succeeded';
}

function getDisplayedRemainingPence(preorder: {
  status: PreorderStatus;
  remainingAmountPence: number;
}) {
  return preorder.status === 'balance_succeeded' ? 0 : preorder.remainingAmountPence;
}

function formatAddress(preorder: {
  addressLine1: string | null;
  addressLine2: string | null;
  addressCity: string | null;
  addressPostalCode: string | null;
  addressCountry: string | null;
}) {
  return [
    preorder.addressLine1,
    preorder.addressLine2,
    preorder.addressCity,
    preorder.addressPostalCode,
    preorder.addressCountry,
  ]
    .filter(Boolean)
    .join(', ');
}

export default async function AdminPage({ searchParams }: Props) {
  await requireAdminAuth();

  const { status, notice } = await searchParams;
  const selectedStatus = statuses.includes(status as PreorderStatus)
    ? (status as PreorderStatus)
    : undefined;

  const preorders = await db.preorder.findMany({
    where: selectedStatus ? { status: selectedStatus } : undefined,
    orderBy: { createdAt: 'desc' },
  });

  return (
    <main className="min-h-screen bg-cream">
      <div className="section py-10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link href="/" className="wordmark text-3xl text-cocoa">
              dump
            </Link>
            <p className="eyebrow mt-8">Admin</p>
            <h1 className="mt-3 font-serif text-4xl tracking-tight text-ink">
              Preorders
            </h1>
            <p className="mt-3 max-w-[60ch] text-sm text-ink/75">
              Review deposit-paid preorders, refund deposits, and charge the remaining{' '}
              {formatPence(PRODUCT.balancePence)} before dispatch.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/export" className="btn-secondary">
              Export CSV
            </Link>
            <form action={logoutAction}>
              <button type="submit" className="btn-secondary">
                Sign out
              </button>
            </form>
          </div>
        </div>

        <div className="mt-8 rounded-[14px] border border-tape bg-white p-5 shadow-soft">
          <form className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="min-w-[220px]">
              <label htmlFor="status" className="mb-2 block text-sm font-medium text-ink">
                Filter by status
              </label>
              <select
                id="status"
                name="status"
                defaultValue={selectedStatus ?? ''}
                className="w-full rounded border border-tape bg-cream px-4 py-3 text-sm text-ink focus:border-cocoa focus:outline-none"
              >
                <option value="">All statuses</option>
                {statuses.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn-primary">
              Apply filter
            </button>
            {selectedStatus ? (
              <Link href="/admin" className="btn-secondary">
                Clear
              </Link>
            ) : null}
          </form>
        </div>

        {notice ? (
          <div className="mt-6 rounded-[12px] border border-tape bg-white px-4 py-3 text-sm text-ink shadow-soft">
            {notice}
          </div>
        ) : null}

        <div className="mt-6">
          <form id="bulk-charge-form" action={bulkChargeRemainingAction} />
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm text-ink/70">
              {preorders.length} preorder{preorders.length === 1 ? '' : 's'}
            </p>
            <button type="submit" form="bulk-charge-form" className="btn-primary">
              Charge selected balances
            </button>
          </div>

          <div className="overflow-hidden rounded-[14px] border border-tape bg-white shadow-soft">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-tape text-left text-sm">
                <thead className="bg-cream/70 text-xs uppercase tracking-[0.14em] text-muted">
                  <tr>
                    <th className="px-4 py-3">
                      <span className="sr-only">Select</span>
                    </th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Deposit</th>
                    <th className="px-4 py-3">Remaining</th>
                    <th className="px-4 py-3">Created</th>
                    <th className="px-4 py-3">Contact & shipping</th>
                    <th className="px-4 py-3">Recovery</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-tape/80">
                  {preorders.map((preorder) => (
                    <tr key={preorder.id} className="align-top">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          name="preorderIds"
                          value={preorder.id}
                          form="bulk-charge-form"
                          disabled={!canAttemptBalanceCharge(preorder.status)}
                          className="h-4 w-4 rounded border-tape text-cocoa focus:ring-cocoa"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-medium text-ink">{preorder.email}</div>
                        <div className="mt-1 text-xs text-muted">
                          {preorder.name || 'No name captured'}
                        </div>
                        <div className="mt-2 space-y-1 text-xs text-muted">
                          <div>Session: {preorder.stripeCheckoutSessionId}</div>
                          <div>Customer: {preorder.stripeCustomerId || '—'}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex rounded-full border border-tape bg-cream px-3 py-1 text-xs font-medium text-ink">
                          {preorder.status}
                        </span>
                        {preorder.lastPaymentError ? (
                          <p className="mt-2 max-w-[24ch] text-xs text-cocoa">
                            {preorder.lastPaymentError}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-4 py-4 text-ink">
                        {formatPence(preorder.depositAmountPence)}
                      </td>
                      <td className="px-4 py-4 text-ink">
                        {formatPence(getDisplayedRemainingPence(preorder))}
                      </td>
                      <td className="px-4 py-4 text-xs text-muted">
                        <div>{formatDate(preorder.createdAt)}</div>
                        <div className="mt-2">
                          Charged:{' '}
                          {preorder.balanceChargeSucceededAt
                            ? formatDate(preorder.balanceChargeSucceededAt)
                            : '—'}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-xs text-muted">
                        <div>{preorder.phone || 'No phone captured'}</div>
                        <div className="mt-2 max-w-[24ch]">
                          {formatAddress(preorder) || 'No address captured'}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-xs">
                        {preorder.recoveryUrl ? (
                          <a
                            href={preorder.recoveryUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="underline underline-offset-4 hover:text-cocoa"
                          >
                            Open recovery link
                          </a>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-2">
                          {canAttemptBalanceCharge(preorder.status) ? (
                            <form action={chargeRemainingBalanceAction}>
                              <input type="hidden" name="preorderId" value={preorder.id} />
                              <button type="submit" className="btn-secondary text-xs">
                                Charge balance
                              </button>
                            </form>
                          ) : null}
                          {canRefundDeposit(preorder.status) ? (
                            <form action={refundDepositAction}>
                              <input type="hidden" name="preorderId" value={preorder.id} />
                              <button type="submit" className="btn-secondary text-xs">
                                Refund deposit
                              </button>
                            </form>
                          ) : null}
                          {canRefundOrder(preorder.status) ? (
                            <form action={refundOrderAction}>
                              <input type="hidden" name="preorderId" value={preorder.id} />
                              <button type="submit" className="btn-secondary text-xs">
                                Refund order
                              </button>
                            </form>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {preorders.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-10 text-center text-sm text-muted">
                        No preorders match this filter yet.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
