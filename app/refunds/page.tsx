import type { Metadata } from 'next';
import { LAUNCH, PRODUCT, SITE } from '@/lib/config';
import LegalPageLayout, { LegalSection } from '@/components/LegalPageLayout';

const lastUpdated = '20 April 2026';

export const metadata: Metadata = {
  title: 'Refund and Cancellation Policy',
  description: `Refund and cancellation terms for ${PRODUCT.name}.`,
};

export default function RefundsPage() {
  return (
    <LegalPageLayout
      title="Refund and Cancellation Policy"
      intro={`This policy explains how cancellations, refunds, and consumer rights work for pre-orders of ${PRODUCT.name}.`}
      lastUpdated={lastUpdated}
    >
      <LegalSection title="1. Pre-orders">
        <p>
          {PRODUCT.name} is currently sold as a preorder item. Your deposit
          reserves stock from an upcoming batch rather than stock that is
          already ready to ship.
        </p>
      </LegalSection>

      <LegalSection title="2. Cancelling before the balance charge">
        <p>
          You may cancel your preorder at any time before we charge the
          remaining balance and receive a full refund of your deposit.
        </p>
        <p>
          To cancel, email{' '}
          <a className="underline underline-offset-4" href={`mailto:${SITE.contactEmail}`}>
            {SITE.contactEmail}
          </a>{' '}
          with the email address used for your order and, if possible, your order
          confirmation details.
        </p>
      </LegalSection>

      <LegalSection title="3. If we miss the promised shipping date">
        <p>
          Our current target shipping date is {LAUNCH.shipDateLong}. If we tell
          you a specific dispatch date and then do not dispatch on time, we will
          issue a full refund automatically for any amount you have paid.
        </p>
      </LegalSection>

      <LegalSection title="4. Your statutory rights">
        <p>
          If you are a UK consumer, you may also have cancellation rights under
          the Consumer Contracts Regulations 2013 and other rights under the
          Consumer Rights Act 2015. Nothing in this policy removes or reduces any
          rights you have by law.
        </p>
      </LegalSection>

      <LegalSection title="5. Damaged, faulty, or incorrect items">
        <p>
          If the item delivered to you is damaged, faulty, or not what you
          ordered, contact us as soon as possible at {SITE.contactEmail} so we can
          put things right.
        </p>
        <p>
          We may ask for photographs or other information to help us assess the
          issue. Depending on the circumstances, we may offer a replacement,
          refund, or another appropriate remedy.
        </p>
      </LegalSection>

      <LegalSection title="6. How refunds are made">
        <p>
          Approved refunds will usually be made back to the original payment
          method used for the order, whether that was your deposit or a later
          balance charge. Timing depends on your payment provider, but
          most refunds appear within a few business days after processing.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
