'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  clearAdminSession,
  createAdminSession,
  requireAdminAuth,
  verifyAdminPassword,
} from '@/lib/admin-auth';
import { chargeRemainingBalance, refundDeposit } from '@/lib/preorder-service';

function toAdminNotice(message: string) {
  return `/admin?notice=${encodeURIComponent(message)}`;
}

export async function loginAction(formData: FormData) {
  const password = String(formData.get('password') ?? '');

  if (!verifyAdminPassword(password)) {
    redirect('/admin/login?error=1');
  }

  await createAdminSession();
  redirect('/admin');
}

export async function logoutAction() {
  await clearAdminSession();
  redirect('/admin/login');
}

export async function refundDepositAction(formData: FormData) {
  await requireAdminAuth();
  const preorderId = String(formData.get('preorderId') ?? '');

  if (!preorderId) {
    redirect(toAdminNotice('Missing preorder id for refund.'));
  }

  await refundDeposit(preorderId);
  revalidatePath('/admin');
  redirect(toAdminNotice('Deposit refunded.'));
}

export async function chargeRemainingBalanceAction(formData: FormData) {
  await requireAdminAuth();
  const preorderId = String(formData.get('preorderId') ?? '');

  if (!preorderId) {
    redirect(toAdminNotice('Missing preorder id for balance charge.'));
  }

  await chargeRemainingBalance(preorderId);
  revalidatePath('/admin');
  redirect(toAdminNotice('Balance charge attempted.'));
}

export async function bulkChargeRemainingAction(formData: FormData) {
  await requireAdminAuth();

  const preorderIds = formData
    .getAll('preorderIds')
    .map((value) => String(value))
    .filter(Boolean);

  if (preorderIds.length === 0) {
    redirect(toAdminNotice('Select at least one preorder first.'));
  }

  let attempted = 0;
  for (const preorderId of preorderIds) {
    attempted += 1;
    try {
      await chargeRemainingBalance(preorderId);
    } catch {
      // Continue through the batch so one failed charge doesn't block the rest.
    }
  }

  revalidatePath('/admin');
  redirect(toAdminNotice(`Attempted balance charges for ${attempted} preorder(s).`));
}
