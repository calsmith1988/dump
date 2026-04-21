import type { Metadata } from 'next';
import { LAUNCH, PRODUCT, SITE } from '@/lib/config';
import LegalPageLayout, { LegalSection } from '@/components/LegalPageLayout';

const lastUpdated = '20 April 2026';

export const metadata: Metadata = {
  title: 'Shipping and Delivery Policy',
  description: `Shipping information for ${PRODUCT.name}.`,
};

export default function ShippingPage() {
  return (
    <LegalPageLayout
      title="Shipping and Delivery Policy"
      intro={`This page explains where we currently ship, when we expect to dispatch pre-orders, and how delivery works for ${PRODUCT.name}.`}
      lastUpdated={lastUpdated}
    >
      <LegalSection title="1. Delivery area">
        <p>
          We currently ship to addresses in the United Kingdom only, unless we
          explicitly state otherwise on the site or at checkout.
        </p>
      </LegalSection>

      <LegalSection title="2. Pre-order dispatch timing">
        <p>
          {PRODUCT.name} is currently being sold on a pre-order basis. Our
          current target dispatch date for the first batch is {LAUNCH.shipDateLong}.
        </p>
        <p>
          Any date shown on the site is an estimate unless we expressly confirm
          otherwise. We will do our best to keep you updated if timings change.
        </p>
      </LegalSection>

      <LegalSection title="3. Delivery timing after dispatch">
        <p>
          Once your order has been dispatched, delivery timing will depend on the
          courier and your delivery address. Any delivery timeframes we provide
          after dispatch are estimates only.
        </p>
      </LegalSection>

      <LegalSection title="4. Delivery issues">
        <p>
          Please make sure the delivery details you provide are accurate. We are
          not responsible for delays or non-delivery caused by incorrect address
          details supplied at checkout.
        </p>
        <p>
          If you believe your order is missing, delayed, or has arrived damaged,
          contact us at{' '}
          <a className="underline underline-offset-4" href={`mailto:${SITE.contactEmail}`}>
            {SITE.contactEmail}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="5. Events outside our control">
        <p>
          Delivery may be delayed by matters outside our reasonable control,
          including courier disruption, severe weather, supply issues, industrial
          action, public health events, or other force majeure events.
        </p>
      </LegalSection>

      <LegalSection title="6. Shipping charges">
        <p>
          Any delivery charges or shipping promotions applicable to your order
          will be shown clearly on the site or at checkout before you complete
          your purchase.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
