import { LAUNCH, PREORDER, PRODUCT } from '@/lib/config';

export const PREORDER_FLOW = 'deposit-preorder';
export const DEPOSIT_CHARGE_TYPE = 'deposit';
export const BALANCE_CHARGE_TYPE = 'balance';
export const RECOVERY_CHARGE_TYPE = 'balance_recovery';

type BuildPreorderMetadataArgs = {
  marketingConsent: boolean;
  initiateCheckoutEventId?: string;
};

export function getShipTargetDate() {
  return new Date(`${LAUNCH.shipDateISO}T00:00:00.000Z`);
}

export function buildPreorderMetadata({
  marketingConsent,
  initiateCheckoutEventId,
}: BuildPreorderMetadataArgs) {
  return {
    preorder_flow: PREORDER_FLOW,
    charge_type: DEPOSIT_CHARGE_TYPE,
    product_sku: PRODUCT.sku,
    ship_date: LAUNCH.shipDateISO,
    ship_target_date: getShipTargetDate().toISOString(),
    terms_version: PREORDER.termsVersion,
    marketing_consent: marketingConsent ? 'true' : 'false',
    deposit_amount_pence: String(PRODUCT.depositPence),
    remaining_amount_pence: String(PRODUCT.balancePence),
    full_price_pence: String(PRODUCT.pricePence),
    ...(initiateCheckoutEventId
      ? { initiate_checkout_event_id: initiateCheckoutEventId }
      : {}),
  } satisfies Record<string, string>;
}

export function isDepositPreorderMetadata(metadata: Record<string, string | null> | null | undefined) {
  return metadata?.preorder_flow === PREORDER_FLOW;
}

export function isTruthyMetadataValue(value: string | null | undefined) {
  return value === 'true';
}
