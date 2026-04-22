import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminAuth } from '@/lib/admin-auth';

function escapeCsv(value: string | null | undefined) {
  const text = value ?? '';
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export async function GET() {
  await requireAdminAuth();

  const preorders = await db.preorder.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const header = [
    'id',
    'email',
    'name',
    'phone',
    'address_line_1',
    'address_line_2',
    'address_city',
    'address_postal_code',
    'address_country',
    'stripe_customer_id',
    'stripe_checkout_session_id',
    'stripe_payment_intent_id',
    'deposit_amount_pence',
    'remaining_amount_pence',
    'currency',
    'status',
    'product_sku',
    'ship_target_date',
    'terms_version',
    'marketing_consent',
    'created_at',
    'balance_charge_attempted_at',
    'balance_charge_succeeded_at',
    'recovery_url',
    'last_payment_error',
  ];

  const rows = preorders.map((preorder) => [
    preorder.id,
    preorder.email,
    preorder.name,
    preorder.phone,
    preorder.addressLine1,
    preorder.addressLine2,
    preorder.addressCity,
    preorder.addressPostalCode,
    preorder.addressCountry,
    preorder.stripeCustomerId,
    preorder.stripeCheckoutSessionId,
    preorder.stripePaymentIntentId,
    String(preorder.depositAmountPence),
    String(preorder.remainingAmountPence),
    preorder.currency,
    preorder.status,
    preorder.productSku,
    preorder.shipTargetDate.toISOString(),
    preorder.termsVersion,
    preorder.marketingConsent ? 'true' : 'false',
    preorder.createdAt.toISOString(),
    preorder.balanceChargeAttemptedAt?.toISOString(),
    preorder.balanceChargeSucceededAt?.toISOString(),
    preorder.recoveryUrl,
    preorder.lastPaymentError,
  ]);

  const csv = [header, ...rows]
    .map((row) => row.map((value) => escapeCsv(value)).join(','))
    .join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="dump-preorders-${new Date()
        .toISOString()
        .slice(0, 10)}.csv"`,
    },
  });
}
