ALTER TABLE "preorders"
ADD COLUMN "phone" TEXT,
ADD COLUMN "address_line_1" TEXT,
ADD COLUMN "address_line_2" TEXT,
ADD COLUMN "address_city" TEXT,
ADD COLUMN "address_postal_code" TEXT,
ADD COLUMN "address_country" TEXT,
ADD COLUMN "stripe_balance_refund_id" TEXT;

CREATE UNIQUE INDEX "preorders_stripe_balance_refund_id_key"
ON "preorders"("stripe_balance_refund_id");
