import type { Metadata } from 'next';
import { COMPANY, LAUNCH, PRODUCT, SITE } from '@/lib/config';
import LegalPageLayout, { LegalSection } from '@/components/LegalPageLayout';

const lastUpdated = '20 April 2026';

export const metadata: Metadata = {
  title: 'Terms and Conditions',
  description: `Terms and Conditions for ${SITE.name}.`,
};

export default function TermsPage() {
  return (
    <LegalPageLayout
      title="Terms and Conditions"
      intro={`These terms govern your use of the ${SITE.name} website and any purchase or pre-order you place for ${PRODUCT.name}. By using the site or placing an order, you agree to these terms.`}
      lastUpdated={lastUpdated}
    >
      <LegalSection title="1. Who we are">
        <p>
          This website is operated by {COMPANY.legalName} (company number{' '}
          {COMPANY.companyNumber}) trading as {SITE.name}.
        </p>
        <p>
          Registered office:
          <br />
          {COMPANY.registeredAddress.map((line) => (
            <span key={line}>
              {line}
              <br />
            </span>
          ))}
        </p>
        <p>
          Contact: <a className="underline underline-offset-4" href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>
        </p>
      </LegalSection>

      <LegalSection title="2. About the product and pre-orders">
        <p>
          {PRODUCT.name} is offered on this site as a pre-order product. This
          means you are paying in advance to reserve stock from an upcoming batch
          rather than buying an item that is already ready for immediate dispatch.
        </p>
        <p>
          Our current target shipping date for the first batch is{' '}
          {LAUNCH.shipDateLong}. Any date shown on the site is an estimate unless
          we expressly say otherwise.
        </p>
        <p>
          If we are unable to supply your pre-order, or if we decide not to
          accept it, we will notify you and refund any payment already taken.
        </p>
      </LegalSection>

      <LegalSection title="3. Eligibility and use of the site">
        <p>
          You must be at least 18 years old and legally capable of entering into
          binding contracts to place an order through this site.
        </p>
        <p>
          You agree not to misuse the site, interfere with its operation, or use
          it for any fraudulent, unlawful, or abusive purpose.
        </p>
      </LegalSection>

      <LegalSection title="4. Orders and contract formation">
        <p>
          When you place an order, you are making an offer to buy the product
          from us. Your order is not accepted until we send confirmation or
          otherwise confirm that we have accepted it.
        </p>
        <p>
          We may refuse or cancel orders where there is an obvious pricing error,
          suspected fraud, supply failure, or another legitimate reason.
        </p>
      </LegalSection>

      <LegalSection title="5. Price and payment">
        <p>
          The price shown on the site at checkout is the price payable for your
          order. Prices may change at any time before you place an order.
        </p>
        <p>
          Payments are processed securely by Stripe. By placing an order, you
          authorise Stripe and us to take payment using your chosen payment
          method.
        </p>
        <p>
          Unless stated otherwise, prices shown on the site include any VAT that
          we are legally required to charge.
        </p>
      </LegalSection>

      <LegalSection title="6. Shipping and delivery">
        <p>
          We currently ship to UK addresses only unless we state otherwise on the
          site or at checkout.
        </p>
        <p>
          Delivery times are estimates. We are not responsible for delays caused
          by events outside our reasonable control, including courier delays,
          customs issues, supply disruption, industrial action, or severe weather.
        </p>
        <p>
          Risk in the product passes to you on delivery. Ownership transfers only
          once we have received payment in full.
        </p>
      </LegalSection>

      <LegalSection title="7. Cancellations, refunds, and your consumer rights">
        <p>
          You may cancel your pre-order at any time before dispatch for a full
          refund by contacting us at {SITE.contactEmail}.
        </p>
        <p>
          In addition, if we do not dispatch by the shipping date we have
          specifically promised for your order, we will refund you in full if you
          ask us to cancel before dispatch.
        </p>
        <p>
          If you are a UK consumer, you may also have cancellation rights under
          the Consumer Contracts Regulations 2013 and other rights under the
          Consumer Rights Act 2015. Nothing in these terms limits any rights you
          have under applicable law.
        </p>
      </LegalSection>

      <LegalSection title="8. Product information and health disclaimer">
        <p>
          We aim to describe our products as accurately as possible. However,
          colours, packaging, and minor presentation details may vary slightly
          from what appears on screen.
        </p>
        <p>
          Information on this site is provided for general information only and
          is not medical advice. Our products are not intended to diagnose, treat,
          cure, or prevent any disease.
        </p>
        <p>
          If you are pregnant, breastfeeding, taking medication, managing a
          medical condition, or have any concerns about whether the product is
          suitable for you, seek advice from a doctor or other qualified health
          professional before use.
        </p>
      </LegalSection>

      <LegalSection title="9. Intellectual property">
        <p>
          All content on this site, including branding, logos, text, product
          descriptions, graphics, images, page design, and software, is owned by
          or licensed to us and is protected by intellectual property laws.
        </p>
        <p>
          You may view the site for personal, non-commercial use only. You may
          not copy, reproduce, distribute, modify, or exploit site content without
          our prior written permission.
        </p>
      </LegalSection>

      <LegalSection title="10. Liability">
        <p>
          We do not exclude or limit liability where it would be unlawful to do
          so, including liability for death or personal injury caused by
          negligence, fraud, or breach of your statutory rights as a consumer.
        </p>
        <p>
          Subject to that, we are not liable for indirect or consequential loss,
          loss of profit, loss of opportunity, or loss arising from your misuse of
          the site or the product.
        </p>
      </LegalSection>

      <LegalSection title="11. Privacy and cookies">
        <p>
          Your use of this site is also governed by our Privacy Policy and Cookie
          Policy, which explain how we collect and use personal data and cookies.
        </p>
      </LegalSection>

      <LegalSection title="12. Changes to these terms">
        <p>
          We may update these terms from time to time. The version published on
          this page at the time you place your order will apply to that order.
        </p>
      </LegalSection>

      <LegalSection title="13. Governing law">
        <p>
          These terms are governed by the laws of {COMPANY.jurisdiction}. If you
          are a consumer, you may also benefit from any mandatory provisions of
          the law of the country in which you live within the UK.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
