CREATE TYPE "PreorderStatus" AS ENUM (
  'deposit_paid',
  'balance_pending',
  'balance_succeeded',
  'balance_failed',
  'cancelled',
  'refunded'
);

CREATE TABLE "preorders" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "name" TEXT,
  "stripe_customer_id" TEXT,
  "stripe_checkout_session_id" TEXT NOT NULL,
  "stripe_payment_intent_id" TEXT,
  "deposit_amount_pence" INTEGER NOT NULL,
  "remaining_amount_pence" INTEGER NOT NULL,
  "currency" TEXT NOT NULL,
  "status" "PreorderStatus" NOT NULL,
  "product_sku" TEXT NOT NULL,
  "ship_target_date" TIMESTAMP(3) NOT NULL,
  "terms_version" TEXT NOT NULL,
  "marketing_consent" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "balance_charge_attempted_at" TIMESTAMP(3),
  "balance_charge_succeeded_at" TIMESTAMP(3),
  "balance_payment_intent_id" TEXT,
  "balance_invoice_id" TEXT,
  "recovery_url" TEXT,
  "last_payment_error" TEXT,
  "stripe_refund_id" TEXT,
  CONSTRAINT "preorders_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "stripe_webhook_events" (
  "id" TEXT NOT NULL,
  "event_type" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "processed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "stripe_webhook_events_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "preorders_stripe_checkout_session_id_key" ON "preorders"("stripe_checkout_session_id");
CREATE UNIQUE INDEX "preorders_stripe_payment_intent_id_key" ON "preorders"("stripe_payment_intent_id");
CREATE UNIQUE INDEX "preorders_balance_payment_intent_id_key" ON "preorders"("balance_payment_intent_id");
CREATE UNIQUE INDEX "preorders_balance_invoice_id_key" ON "preorders"("balance_invoice_id");
CREATE UNIQUE INDEX "preorders_stripe_refund_id_key" ON "preorders"("stripe_refund_id");

CREATE INDEX "preorders_email_idx" ON "preorders"("email");
CREATE INDEX "preorders_status_idx" ON "preorders"("status");
CREATE INDEX "preorders_stripe_customer_id_idx" ON "preorders"("stripe_customer_id");
CREATE INDEX "preorders_created_at_idx" ON "preorders"("created_at");
