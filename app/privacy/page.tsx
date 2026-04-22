import type { Metadata } from 'next';
import { COMPANY, SITE } from '@/lib/config';
import LegalPageLayout, { LegalSection } from '@/components/LegalPageLayout';

const lastUpdated = '20 April 2026';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `Privacy Policy for ${SITE.name}.`,
};

export default function PrivacyPage() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      intro={`This policy explains how ${COMPANY.legalName} collects, uses, stores, and shares personal data when you use ${SITE.name}, contact us, or place an order.`}
      lastUpdated={lastUpdated}
    >
      <LegalSection title="1. Who controls your data">
        <p>
          For the purposes of UK data protection law, the data controller is{' '}
          {COMPANY.legalName} (company number {COMPANY.companyNumber}).
        </p>
        <p>
          Contact:
          <br />
          <a className="underline underline-offset-4" href={`mailto:${SITE.contactEmail}`}>
            {SITE.contactEmail}
          </a>
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
      </LegalSection>

      <LegalSection title="2. What personal data we collect">
        <p>Depending on how you interact with the site, we may collect:</p>
        <ul className="list-disc pl-5">
          <li>your name, billing address, delivery address, email address, and phone number;</li>
          <li>order, preorder, deposit, and payment-related information;</li>
          <li>communications you send to us;</li>
          <li>technical information such as IP address, browser type, device information, and referral source;</li>
          <li>usage and advertising data collected through cookies, analytics, and advertising technologies.</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. How we collect data">
        <p>We collect personal data when you:</p>
        <ul className="list-disc pl-5">
          <li>visit or interact with the website;</li>
          <li>start or complete a checkout through Stripe;</li>
          <li>contact us by email or another contact method;</li>
          <li>accept cookies or interact with advertising and analytics tools.</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. How we use your data">
        <p>We use personal data to:</p>
        <ul className="list-disc pl-5">
          <li>operate the website and provide customer support;</li>
          <li>process deposits, saved-payment authorisations, remaining-balance charges, shipping, refunds, and cancellations;</li>
          <li>prevent fraud and protect the security of the site;</li>
          <li>understand how people use the site and improve performance;</li>
          <li>measure advertising effectiveness and build relevant audiences for ads;</li>
          <li>comply with legal and regulatory obligations.</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Our legal bases">
        <p>Under UK GDPR, we rely on one or more of the following legal bases:</p>
        <ul className="list-disc pl-5">
          <li>performance of a contract, where we need your data to process orders or respond to pre-contract enquiries;</li>
          <li>legal obligation, where we need to keep records or comply with consumer, tax, or regulatory requirements;</li>
          <li>legitimate interests, including operating, securing, and improving the website and preventing fraud;</li>
          <li>consent, where required for non-essential cookies, analytics, or advertising technologies.</li>
        </ul>
      </LegalSection>

      <LegalSection title="6. Who we share data with">
        <p>We may share personal data with trusted service providers who help us run the website and business, including:</p>
        <ul className="list-disc pl-5">
          <li>Stripe, to process payments and related checkout activity;</li>
          <li>our website hosting and infrastructure providers;</li>
          <li>Google Analytics, to understand site traffic and usage;</li>
          <li>Google Ads, to measure campaigns and serve or optimise advertising;</li>
          <li>Meta, to measure advertising performance and build relevant ad audiences;</li>
          <li>professional advisers, regulators, law enforcement, or courts where required.</li>
        </ul>
        <p>
          We do not sell your personal data for money. However, some advertising
          tools may use cookie-based data sharing in ways that count as targeted
          advertising or cross-context behavioural advertising under some laws.
        </p>
      </LegalSection>

      <LegalSection title="7. International transfers">
        <p>
          Some of our service providers may process personal data outside the UK.
          Where this happens, we take steps to ensure that appropriate safeguards
          are in place, such as adequacy decisions or approved contractual
          protections.
        </p>
      </LegalSection>

      <LegalSection title="8. Data retention">
        <p>
          We keep personal data only for as long as reasonably necessary for the
          purposes set out in this policy, including to process orders, handle
          complaints, maintain business records, comply with legal obligations,
          and resolve disputes.
        </p>
      </LegalSection>

      <LegalSection title="9. Your rights">
        <p>
          Depending on your circumstances, you may have the right to request
          access to your data, correction, erasure, restriction, objection, and
          data portability, and to withdraw consent where processing depends on
          consent.
        </p>
        <p>
          To exercise your rights, contact us at{' '}
          <a className="underline underline-offset-4" href={`mailto:${SITE.contactEmail}`}>
            {SITE.contactEmail}
          </a>
          .
        </p>
        <p>
          You also have the right to complain to the UK Information
          Commissioner&apos;s Office (ICO) if you believe your data has been handled
          unlawfully.
        </p>
      </LegalSection>

      <LegalSection title="10. Cookies and tracking">
        <p>
          We use cookies and similar technologies for essential site functions,
          analytics, and advertising. For more detail, see our Cookie Policy.
        </p>
      </LegalSection>

      <LegalSection title="11. Security">
        <p>
          We use reasonable technical and organisational measures to protect
          personal data. However, no system or internet transmission is ever
          completely secure.
        </p>
      </LegalSection>

      <LegalSection title="12. Changes to this policy">
        <p>
          We may update this policy from time to time. The latest version will
          always be published on this page with a revised last-updated date.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
