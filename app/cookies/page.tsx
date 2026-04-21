import type { Metadata } from 'next';
import { SITE } from '@/lib/config';
import LegalPageLayout, { LegalSection } from '@/components/LegalPageLayout';

const lastUpdated = '20 April 2026';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: `Cookie Policy for ${SITE.name}.`,
};

export default function CookiesPage() {
  return (
    <LegalPageLayout
      title="Cookie Policy"
      intro={`This policy explains how ${SITE.name} uses cookies and similar technologies on this website.`}
      lastUpdated={lastUpdated}
    >
      <LegalSection title="1. What cookies are">
        <p>
          Cookies are small text files placed on your device when you visit a
          website. They help the website function, remember preferences, measure
          performance, and support advertising and marketing.
        </p>
      </LegalSection>

      <LegalSection title="2. Types of cookies we may use">
        <p>We may use the following categories of cookies or similar technologies:</p>
        <ul className="list-disc pl-5">
          <li>
            <strong>Strictly necessary cookies</strong> to enable core site and
            checkout functionality.
          </li>
          <li>
            <strong>Analytics cookies</strong> to understand how visitors use the
            website and improve performance.
          </li>
          <li>
            <strong>Advertising cookies</strong> to measure campaigns, improve ad
            relevance, and build audiences for services such as Google Ads and
            Meta.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Services currently relevant to this site">
        <p>This site may use cookies or similar technologies from or relating to:</p>
        <ul className="list-disc pl-5">
          <li>Stripe, to support secure checkout and payment processing;</li>
          <li>Google Analytics, to measure site traffic and usage;</li>
          <li>Google Ads, to measure ad performance and support advertising;</li>
          <li>Meta, to measure ad performance and support audience building and remarketing.</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Consent">
        <p>
          Where required by law, we will ask for your consent before placing
          non-essential cookies on your device. Strictly necessary cookies do not
          require consent.
        </p>
      </LegalSection>

      <LegalSection title="5. Managing cookies">
        <p>
          You can usually control or delete cookies through your browser settings.
          Please note that blocking some cookies may affect how the website or
          checkout functions.
        </p>
      </LegalSection>

      <LegalSection title="6. More information">
        <p>
          For more information about how we process personal data, please see our
          Privacy Policy.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
