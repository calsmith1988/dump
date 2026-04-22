import { Prisma, Preorder, PreorderStatus } from '@prisma/client';
import { Resend } from 'resend';
import Stripe from 'stripe';
import { db } from '@/lib/db';
import { EMAIL, LAUNCH, PREORDER, PRODUCT, SITE } from '@/lib/config';
import {
  BALANCE_CHARGE_TYPE,
  DEPOSIT_CHARGE_TYPE,
  RECOVERY_CHARGE_TYPE,
  getShipTargetDate,
  isDepositPreorderMetadata,
  isTruthyMetadataValue,
} from '@/lib/preorders';
import { stripe } from '@/lib/stripe';

type CheckoutSessionWithShipping = Stripe.Checkout.Session & {
  collected_information?: {
    shipping_details?: {
      address?: Stripe.Address | null;
      name?: string | null;
    } | null;
  } | null;
  shipping_details?: {
    address?: Stripe.Address | null;
    name?: string | null;
  } | null;
};

const ALLOWED_BALANCE_CHARGE_STATUSES: PreorderStatus[] = [
  'deposit_paid',
  'balance_failed',
];

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

function getStripeCustomerId(value: string | Stripe.Customer | Stripe.DeletedCustomer | null) {
  return typeof value === 'string' ? value : null;
}

function getStripePaymentIntentId(
  value: string | Stripe.PaymentIntent | null,
) {
  return typeof value === 'string' ? value : value?.id ?? null;
}

function getNameParts(name: string | null | undefined) {
  const trimmed = name?.trim();
  if (!trimmed) return { firstName: null, lastName: null };
  const [firstName, ...rest] = trimmed.split(/\s+/);
  return {
    firstName,
    lastName: rest.join(' ') || null,
  };
}

function getCheckoutAddress(
  shipping: CheckoutSessionWithShipping['shipping_details'] | CheckoutSessionWithShipping['collected_information'] extends infer _ ? {
    address?: Stripe.Address | null;
    name?: string | null;
  } | null | undefined : never,
  customer: Stripe.Checkout.Session.CustomerDetails | null | undefined,
) {
  return shipping?.address ?? customer?.address ?? null;
}

async function resolveBalancePaymentIntentId(preorder: Preorder) {
  if (preorder.balancePaymentIntentId) {
    return preorder.balancePaymentIntentId;
  }

  if (!preorder.balanceInvoiceId) {
    return null;
  }

  const invoice = await stripe.invoices.retrieve(preorder.balanceInvoiceId);
  return typeof invoice.payment_intent === 'string'
    ? invoice.payment_intent
    : invoice.payment_intent?.id ?? null;
}

async function setCustomerDefaultPaymentMethod(customerId: string, paymentMethodId: string) {
  await stripe.customers.update(customerId, {
    invoice_settings: {
      default_payment_method: paymentMethodId,
    },
  });
}

async function getSavedPaymentMethodForCustomer(customerId: string) {
  const customer = await stripe.customers.retrieve(customerId, {
    expand: ['invoice_settings.default_payment_method'],
  });

  if (!customer.deleted) {
    const defaultPaymentMethod = customer.invoice_settings.default_payment_method;
    if (defaultPaymentMethod && typeof defaultPaymentMethod !== 'string') {
      return defaultPaymentMethod.id;
    }
    if (typeof defaultPaymentMethod === 'string') {
      return defaultPaymentMethod;
    }
  }

  const paymentMethods = await stripe.paymentMethods.list({
    customer: customerId,
    type: 'card',
    limit: 1,
  });

  return paymentMethods.data[0]?.id ?? null;
}

function isUniqueConstraintError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  );
}

function formatGBPFromPence(pence: number) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(pence / 100);
}

async function sendCustomerEmail({
  to,
  subject,
  text,
}: {
  to: string;
  subject: string;
  text: string;
}) {
  const resend = getResendClient();
  if (!resend) return;

  try {
    await resend.emails.send({
      from: EMAIL.from,
      to,
      subject,
      text,
    });
  } catch (error) {
    console.error('[email] Failed to send customer email', error);
  }
}

async function sendDepositPaidEmail(preorder: Preorder) {
  const { firstName } = getNameParts(preorder.name);

  await sendCustomerEmail({
    to: preorder.email,
    subject: `You’re in: your dump ${PRODUCT.name} deposit is confirmed`,
    text: [
      `Hi ${firstName || 'there'},`,
      '',
      `Thanks — your ${formatGBPFromPence(preorder.depositAmountPence)} deposit for dump ${PRODUCT.name} is confirmed.`,
      '',
      'Your preorder is reserved from the first batch.',
      `Target ship date: ${LAUNCH.shipDateLong}`,
      `We’ll charge the remaining ${formatGBPFromPence(preorder.remainingAmountPence)} before dispatch using the payment method you saved with Stripe.`,
      '',
      `If you need help or want to cancel before the balance is charged, just email ${SITE.contactEmail}.`,
      '',
      SITE.name,
    ].join('\n'),
  });
}

async function sendBalancePaidEmail(preorder: Preorder) {
  const { firstName } = getNameParts(preorder.name);

  await sendCustomerEmail({
    to: preorder.email,
    subject: `Your remaining payment for dump ${PRODUCT.name} is complete`,
    text: [
      `Hi ${firstName || 'there'},`,
      '',
      `We’ve successfully taken the remaining ${formatGBPFromPence(preorder.remainingAmountPence)} for your dump ${PRODUCT.name} preorder.`,
      '',
      `Your order is now fully paid and on track for dispatch by ${LAUNCH.shipDateLong}.`,
      '',
      `If you need anything, just email ${SITE.contactEmail}.`,
      '',
      SITE.name,
    ].join('\n'),
  });
}

async function sendRefundProcessedEmail(preorder: Preorder, refundedAmountPence: number) {
  const { firstName } = getNameParts(preorder.name);

  await sendCustomerEmail({
    to: preorder.email,
    subject: `Your dump ${PRODUCT.name} payment has been refunded`,
    text: [
      `Hi ${firstName || 'there'},`,
      '',
      `We’ve issued a refund of ${formatGBPFromPence(refundedAmountPence)} for your dump ${PRODUCT.name} preorder.`,
      '',
      'Depending on your bank, it may take a few business days to show in your account.',
      '',
      `If you have any questions, email ${SITE.contactEmail} and we’ll help.`,
      '',
      SITE.name,
    ].join('\n'),
  });
}

async function createRecoveryInvoice(preorder: Preorder) {
  if (!preorder.stripeCustomerId) {
    throw new Error('Preorder is missing a Stripe customer.');
  }

  if (preorder.balanceInvoiceId) {
    try {
      const existingInvoice = await stripe.invoices.retrieve(preorder.balanceInvoiceId);
      if (existingInvoice.hosted_invoice_url) {
        return {
          invoiceId: existingInvoice.id,
          recoveryUrl: existingInvoice.hosted_invoice_url,
        };
      }
    } catch {
      // Fall through and create a fresh invoice if the previous one no longer exists.
    }
  }

  await stripe.invoiceItems.create({
    customer: preorder.stripeCustomerId,
    amount: preorder.remainingAmountPence,
    currency: preorder.currency.toLowerCase(),
    description: `${PRODUCT.name} balance payment`,
    metadata: {
      preorder_id: preorder.id,
      product_sku: preorder.productSku,
      charge_type: RECOVERY_CHARGE_TYPE,
      ship_target_date: preorder.shipTargetDate.toISOString(),
    },
  });

  const invoice = await stripe.invoices.create({
    customer: preorder.stripeCustomerId,
    auto_advance: false,
    collection_method: 'send_invoice',
    days_until_due: 7,
    metadata: {
      preorder_id: preorder.id,
      charge_type: RECOVERY_CHARGE_TYPE,
      product_sku: preorder.productSku,
    },
  });

  const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);
  return {
    invoiceId: finalizedInvoice.id,
    recoveryUrl: finalizedInvoice.hosted_invoice_url ?? null,
  };
}

async function sendRecoveryEmail(preorder: Preorder, recoveryUrl: string | null) {
  if (!recoveryUrl) return;
  const { firstName } = getNameParts(preorder.name);

  await sendCustomerEmail({
    to: preorder.email,
    subject: `Action needed: complete your remaining payment for dump ${PRODUCT.name}`,
    text: [
      `Hi ${firstName || 'there'},`,
      '',
      `A quick heads-up: we tried to take the remaining ${PRODUCT.balanceGBP} for your ${PRODUCT.name} preorder, but the saved payment method didn't go through.`,
      '',
      'Your preorder is still reserved for now. To complete it, use the secure payment link below:',
      '',
      recoveryUrl,
      '',
      `Target ship date: ${LAUNCH.shipDateLong}`,
      '',
      `Need help or want to cancel before dispatch? Just email ${SITE.contactEmail} and we'll sort it.`,
      '',
      SITE.name,
    ].join('\n'),
  });
}

async function markBalanceFailed(preorder: Preorder, errorMessage: string | null) {
  const recovery = await createRecoveryInvoice(preorder);

  const updated = await db.preorder.update({
    where: { id: preorder.id },
    data: {
      status: 'balance_failed',
      recoveryUrl: recovery.recoveryUrl,
      balanceInvoiceId: recovery.invoiceId,
      lastPaymentError: errorMessage,
      balanceChargeAttemptedAt: new Date(),
    },
  });

  await sendRecoveryEmail(updated, recovery.recoveryUrl);
  return updated;
}

export async function recordStripeWebhookEvent(eventId: string, eventType: string) {
  try {
    await db.stripeWebhookEvent.create({
      data: {
        id: eventId,
        eventType,
      },
    });
    return true;
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return false;
    }
    throw error;
  }
}

export async function persistCompletedCheckoutSession(session: Stripe.Checkout.Session) {
  const checkoutSession = session as CheckoutSessionWithShipping;

  if (!isDepositPreorderMetadata(checkoutSession.metadata)) {
    return null;
  }

  const stripeCustomerId = getStripeCustomerId(checkoutSession.customer);
  const stripePaymentIntentId = getStripePaymentIntentId(checkoutSession.payment_intent);

  if (!stripeCustomerId) {
    throw new Error('Checkout session did not produce a Stripe customer.');
  }

  const shipping =
    checkoutSession.collected_information?.shipping_details ??
    checkoutSession.shipping_details;
  const customer = checkoutSession.customer_details;
  const name = shipping?.name ?? customer?.name ?? null;
  const email = customer?.email;
  const address = getCheckoutAddress(shipping, customer);

  if (!email) {
    throw new Error('Checkout session did not include a customer email.');
  }

  if (stripePaymentIntentId) {
    const paymentIntent = await stripe.paymentIntents.retrieve(stripePaymentIntentId);
    const paymentMethodId =
      typeof paymentIntent.payment_method === 'string'
        ? paymentIntent.payment_method
        : paymentIntent.payment_method?.id ?? null;

    if (paymentMethodId) {
      await setCustomerDefaultPaymentMethod(stripeCustomerId, paymentMethodId);
    }
  }

  const preorder = await db.preorder.upsert({
    where: {
      stripeCheckoutSessionId: checkoutSession.id,
    },
    update: {
      email,
      name,
      phone: customer?.phone ?? null,
      addressLine1: address?.line1 ?? null,
      addressLine2: address?.line2 ?? null,
      addressCity: address?.city ?? null,
      addressPostalCode: address?.postal_code ?? null,
      addressCountry: address?.country ?? null,
      stripeCustomerId,
      stripePaymentIntentId,
      depositAmountPence: checkoutSession.amount_total ?? PRODUCT.depositPence,
      remainingAmountPence: PRODUCT.balancePence,
      currency: (checkoutSession.currency ?? 'gbp').toUpperCase(),
      status: 'deposit_paid',
      productSku: checkoutSession.metadata?.product_sku ?? PRODUCT.sku,
      shipTargetDate: getShipTargetDate(),
      termsVersion: checkoutSession.metadata?.terms_version ?? PREORDER.termsVersion,
      marketingConsent: isTruthyMetadataValue(checkoutSession.metadata?.marketing_consent),
      recoveryUrl: null,
      balanceInvoiceId: null,
      lastPaymentError: null,
    },
    create: {
      email,
      name,
      phone: customer?.phone ?? null,
      addressLine1: address?.line1 ?? null,
      addressLine2: address?.line2 ?? null,
      addressCity: address?.city ?? null,
      addressPostalCode: address?.postal_code ?? null,
      addressCountry: address?.country ?? null,
      stripeCustomerId,
      stripeCheckoutSessionId: checkoutSession.id,
      stripePaymentIntentId,
      depositAmountPence: checkoutSession.amount_total ?? PRODUCT.depositPence,
      remainingAmountPence: PRODUCT.balancePence,
      currency: (checkoutSession.currency ?? 'gbp').toUpperCase(),
      status: 'deposit_paid',
      productSku: checkoutSession.metadata?.product_sku ?? PRODUCT.sku,
      shipTargetDate: getShipTargetDate(),
      termsVersion: checkoutSession.metadata?.terms_version ?? PREORDER.termsVersion,
      marketingConsent: isTruthyMetadataValue(checkoutSession.metadata?.marketing_consent),
    },
  });

  await sendDepositPaidEmail(preorder);
  return preorder;
}

export async function chargeRemainingBalance(
  preorderId: string,
  collectionMode: 'payment_intent' | 'invoice' = PREORDER.balanceCollectionMode,
) {
  const preorder = await db.preorder.findUnique({
    where: { id: preorderId },
  });

  if (!preorder) {
    throw new Error('Preorder not found.');
  }

  if (!ALLOWED_BALANCE_CHARGE_STATUSES.includes(preorder.status)) {
    throw new Error(`Cannot charge preorder in status "${preorder.status}".`);
  }

  if (!preorder.stripeCustomerId) {
    throw new Error('Preorder is missing a Stripe customer id.');
  }

  if (preorder.remainingAmountPence <= 0) {
    throw new Error('This preorder has no remaining balance to charge.');
  }

  await db.preorder.update({
    where: { id: preorder.id },
    data: {
      status: 'balance_pending',
      balanceChargeAttemptedAt: new Date(),
      lastPaymentError: null,
    },
  });

  const paymentMethodId = await getSavedPaymentMethodForCustomer(preorder.stripeCustomerId);
  if (!paymentMethodId) {
    return markBalanceFailed(preorder, 'No saved payment method was available for this customer.');
  }

  if (collectionMode === 'invoice') {
    try {
      await setCustomerDefaultPaymentMethod(preorder.stripeCustomerId, paymentMethodId);

      await stripe.invoiceItems.create({
        customer: preorder.stripeCustomerId,
        amount: preorder.remainingAmountPence,
        currency: preorder.currency.toLowerCase(),
        description: `${PRODUCT.name} balance payment`,
        metadata: {
          preorder_id: preorder.id,
          charge_type: BALANCE_CHARGE_TYPE,
          product_sku: preorder.productSku,
        },
      });

      const invoice = await stripe.invoices.create({
        customer: preorder.stripeCustomerId,
        auto_advance: false,
        collection_method: 'charge_automatically',
        metadata: {
          preorder_id: preorder.id,
          charge_type: BALANCE_CHARGE_TYPE,
          product_sku: preorder.productSku,
        },
      });

      const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);
      const paidInvoice = await stripe.invoices.pay(finalizedInvoice.id);

      if (paidInvoice.status === 'paid') {
        const updated = await db.preorder.update({
          where: { id: preorder.id },
          data: {
            status: 'balance_succeeded',
            balanceInvoiceId: paidInvoice.id,
            balanceChargeSucceededAt: new Date(),
            recoveryUrl: null,
            lastPaymentError: null,
          },
        });

        await sendBalancePaidEmail(updated);
        return updated;
      }

      return markBalanceFailed(
        preorder,
        'Automatic invoice collection did not complete successfully.',
      );
    } catch (error) {
      const message =
        error instanceof Stripe.errors.StripeError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Unknown invoice payment error.';

      return markBalanceFailed(preorder, message);
    }
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: preorder.remainingAmountPence,
      currency: preorder.currency.toLowerCase(),
      customer: preorder.stripeCustomerId,
      payment_method: paymentMethodId,
      off_session: true,
      confirm: true,
      metadata: {
        preorder_id: preorder.id,
        checkout_session_id: preorder.stripeCheckoutSessionId,
        product_sku: preorder.productSku,
        charge_type: BALANCE_CHARGE_TYPE,
        ship_target_date: preorder.shipTargetDate.toISOString(),
      },
    });

    if (paymentIntent.status === 'succeeded') {
      const updated = await db.preorder.update({
        where: { id: preorder.id },
        data: {
          status: 'balance_succeeded',
          balancePaymentIntentId: paymentIntent.id,
          balanceChargeSucceededAt: new Date(),
          recoveryUrl: null,
          lastPaymentError: null,
        },
      });

      await sendBalancePaidEmail(updated);
      return updated;
    }

    return markBalanceFailed(
      preorder,
      `Balance charge returned unexpected status: ${paymentIntent.status}.`,
    );
  } catch (error) {
    const message =
      error instanceof Stripe.errors.StripeError
        ? error.message
        : error instanceof Error
          ? error.message
          : 'Unknown payment error.';

    return markBalanceFailed(preorder, message);
  }
}

export async function refundDeposit(preorderId: string) {
  const preorder = await db.preorder.findUnique({
    where: { id: preorderId },
  });

  if (!preorder) {
    throw new Error('Preorder not found.');
  }

  if (!preorder.stripePaymentIntentId) {
    throw new Error('No deposit payment intent is stored for this preorder.');
  }

  const refund = await stripe.refunds.create({
    payment_intent: preorder.stripePaymentIntentId,
    amount: preorder.depositAmountPence,
    reason: 'requested_by_customer',
    metadata: {
      preorder_id: preorder.id,
      product_sku: preorder.productSku,
      charge_type: DEPOSIT_CHARGE_TYPE,
    },
  });

  const updated = await db.preorder.update({
    where: { id: preorder.id },
    data: {
      status: 'refunded',
      stripeRefundId: refund.id,
      lastPaymentError: null,
    },
  });

  await sendRefundProcessedEmail(updated, preorder.depositAmountPence);
  return updated;
}

export async function refundOrder(preorderId: string) {
  const preorder = await db.preorder.findUnique({
    where: { id: preorderId },
  });

  if (!preorder) {
    throw new Error('Preorder not found.');
  }

  if (preorder.status !== 'balance_succeeded') {
    throw new Error('Full-order refunds are only available after the balance succeeds.');
  }

  if (!preorder.stripePaymentIntentId) {
    throw new Error('No deposit payment intent is stored for this preorder.');
  }

  const balancePaymentIntentId = await resolveBalancePaymentIntentId(preorder);
  if (!balancePaymentIntentId) {
    throw new Error('No balance payment intent is stored for this preorder.');
  }

  const depositRefund = await stripe.refunds.create({
    payment_intent: preorder.stripePaymentIntentId,
    amount: preorder.depositAmountPence,
    reason: 'requested_by_customer',
    metadata: {
      preorder_id: preorder.id,
      product_sku: preorder.productSku,
      charge_type: DEPOSIT_CHARGE_TYPE,
    },
  });

  const balanceRefund = await stripe.refunds.create({
    payment_intent: balancePaymentIntentId,
    amount: preorder.remainingAmountPence,
    reason: 'requested_by_customer',
    metadata: {
      preorder_id: preorder.id,
      product_sku: preorder.productSku,
      charge_type: BALANCE_CHARGE_TYPE,
    },
  });

  const updated = await db.preorder.update({
    where: { id: preorder.id },
    data: {
      status: 'refunded',
      stripeRefundId: depositRefund.id,
      stripeBalanceRefundId: balanceRefund.id,
      lastPaymentError: null,
      recoveryUrl: null,
    },
  });

  await sendRefundProcessedEmail(
    updated,
    preorder.depositAmountPence + preorder.remainingAmountPence,
  );
  return updated;
}

export async function deletePreorder(preorderId: string) {
  const preorder = await db.preorder.findUnique({
    where: { id: preorderId },
  });

  if (!preorder) {
    throw new Error('Preorder not found.');
  }

  await db.preorder.delete({
    where: { id: preorderId },
  });
}

export async function syncBalancePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  if (paymentIntent.metadata?.charge_type !== BALANCE_CHARGE_TYPE) {
    return null;
  }

  const preorderId = paymentIntent.metadata?.preorder_id;
  if (!preorderId) {
    return null;
  }

  return db.preorder.update({
    where: { id: preorderId },
    data: {
      status: 'balance_succeeded',
      balancePaymentIntentId: paymentIntent.id,
      balanceChargeSucceededAt: new Date(),
      lastPaymentError: null,
    },
  });
}

export async function syncBalancePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  if (paymentIntent.metadata?.charge_type !== BALANCE_CHARGE_TYPE) {
    return null;
  }

  const preorderId = paymentIntent.metadata?.preorder_id;
  if (!preorderId) {
    return null;
  }

  const preorder = await db.preorder.findUnique({
    where: { id: preorderId },
  });

  if (!preorder) {
    return null;
  }

  return markBalanceFailed(
    preorder,
    paymentIntent.last_payment_error?.message ?? 'The saved payment method could not be charged.',
  );
}
