import LegalLayout, { Section } from "@/components/LegalLayout";
import { LegalSection, P, Ul, Li, Callout, Strong, SubHeading } from "@/components/LegalSection";

const sections: Section[] = [
  { id: "overview", label: "Overview" },
  { id: "information-collected", label: "Information we collect" },
  { id: "how-we-use", label: "How we use your data" },
  { id: "agent-data", label: "Agent session data" },
  { id: "sharing", label: "Sharing & disclosure" },
  { id: "retention", label: "Data retention" },
  { id: "security", label: "Security" },
  { id: "cookies", label: "Cookies & tracking" },
  { id: "your-rights", label: "Your rights" },
  { id: "children", label: "Children's privacy" },
  { id: "international", label: "International transfers" },
  { id: "changes", label: "Changes to this policy" },
  { id: "contact", label: "Contact us" },
];

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy policy"
      subtitle="Prizmsol AI agent platform"
      effectiveDate="April 11, 2026"
      version="2.0"
      currentPage="privacy"
      summary="We collect information to provide, improve, and secure the Prizmsol service. We do not sell your personal data to third parties. This policy explains what we collect, why we collect it, and the controls you have over your information."
      sections={sections}
    >
      <LegalSection id="overview" num="01" title="Overview">
        <P>
          Prizmsol Technologies, Inc. ("Prizmsol," "we," "our," or "us") is committed to protecting your privacy. This Privacy Policy describes how we collect, use, store, and share information when you use the Prizmsol AI agent platform ("Service").
        </P>
        <P>
          This policy applies to all users of the Service, including individuals accessing the platform via our web application, API, or third-party integrations.
        </P>
        <Callout>
          If you have questions about our data practices, you can reach our Privacy team at <Strong>privacy@prizmsol.com</Strong> at any time.
        </Callout>
      </LegalSection>

      <LegalSection id="information-collected" num="02" title="Information we collect">
        <P>We collect information in three ways: information you provide directly, information collected automatically, and information received from third parties.</P>

        <SubHeading>Information you provide</SubHeading>
        <Ul>
          <Li><Strong>Account data:</Strong> name, email address, password, and billing information when you register.</Li>
          <Li><Strong>Profile data:</Strong> optional preferences, job title, or organization name you add to your account.</Li>
          <Li><Strong>Task instructions:</Strong> the natural-language prompts, goals, and files you submit to the agent.</Li>
          <Li><Strong>Communications:</Strong> messages you send to our support team or feedback you submit.</Li>
        </Ul>

        <SubHeading>Information collected automatically</SubHeading>
        <Ul>
          <Li><Strong>Usage data:</Strong> pages visited, features used, session duration, click patterns, and error logs.</Li>
          <Li><Strong>Device & connection data:</Strong> IP address, browser type, operating system, and time zone.</Li>
          <Li><Strong>Agent execution logs:</Strong> records of steps the agent took to complete your tasks (see Section 04).</Li>
          <Li><Strong>Performance data:</Strong> latency, success/failure rates, and other telemetry used to improve reliability.</Li>
        </Ul>

        <SubHeading>Information from third parties</SubHeading>
        <Ul>
          <Li><Strong>OAuth integrations:</Strong> when you connect third-party accounts (e.g. Google, Notion, Slack), we receive limited profile and access-scope data from those providers.</Li>
          <Li><Strong>Payment processors:</Strong> our payment processor (Stripe) shares transaction confirmations and billing status with us. We never see or store your full card number.</Li>
        </Ul>
      </LegalSection>

      <LegalSection id="how-we-use" num="03" title="How we use your data">
        <P>We use the information we collect to:</P>
        <Ul>
          <Li>Provide, operate, and maintain the Service.</Li>
          <Li>Authenticate your identity and keep your account secure.</Li>
          <Li>Process payments and manage your subscription.</Li>
          <Li>Send transactional communications (receipts, security alerts, critical updates).</Li>
          <Li>Improve the accuracy, safety, and capability of the AI agent, using aggregated and de-identified data.</Li>
          <Li>Detect, investigate, and prevent fraudulent or illegal activity.</Li>
          <Li>Comply with legal obligations.</Li>
        </Ul>
        <P>
          We do not use your data to train our models on individually identifiable task content without your explicit opt-in consent, which can be granted or revoked in your account settings.
        </P>
      </LegalSection>

      <LegalSection id="agent-data" num="04" title="Agent session data">
        <P>
          When you run a task, Prizmsol records a session log that includes your original instruction, intermediate reasoning steps, tool calls made, and the final output. This data is necessary to:
        </P>
        <Ul>
          <Li>Display task history in your dashboard.</Li>
          <Li>Allow you to resume or replay tasks.</Li>
          <Li>Debug errors and investigate complaints.</Li>
          <Li>Detect misuse of the Service.</Li>
        </Ul>
        <P>
          Session logs are associated with your account and retained for 90 days by default. You may delete individual sessions or all session history at any time from your account settings. Deleted sessions are purged from our systems within 30 days.
        </P>
        <Callout>
          Avoid submitting sensitive personal data (health records, financial credentials, government IDs) as part of agent instructions. If you do, that data will be present in your session logs subject to this policy.
        </Callout>
      </LegalSection>

      <LegalSection id="sharing" num="05" title="Sharing & disclosure">
        <P>We do not sell, rent, or trade your personal data. We share information only in the following circumstances:</P>
        <Ul>
          <Li><Strong>Service providers:</Strong> trusted vendors who help us operate the Service (cloud hosting, payment processing, email delivery) under strict data processing agreements.</Li>
          <Li><Strong>Legal requirements:</Strong> when required by law, subpoena, or court order, or when we believe disclosure is necessary to protect the rights, property, or safety of Prizmsol, our users, or the public.</Li>
          <Li><Strong>Business transfers:</Strong> in connection with a merger, acquisition, or sale of assets, in which case we will notify you and give you the opportunity to delete your account before any transfer takes effect.</Li>
          <Li><Strong>With your consent:</Strong> for any other purpose, with your explicit consent.</Li>
        </Ul>
      </LegalSection>

      <LegalSection id="retention" num="06" title="Data retention">
        <P>We retain your personal data for as long as your account is active or as needed to provide the Service. Specific retention periods:</P>
        <Ul>
          <Li><Strong>Account data:</Strong> retained for the life of your account, plus 30 days after deletion to process final billing and handle disputes.</Li>
          <Li><Strong>Agent session logs:</Strong> 90 days by default, configurable to 30 days or 1 year in account settings.</Li>
          <Li><Strong>Usage & telemetry data:</Strong> up to 24 months in aggregate, anonymized form.</Li>
          <Li><Strong>Billing records:</Strong> 7 years, as required by financial regulations.</Li>
        </Ul>
      </LegalSection>

      <LegalSection id="security" num="07" title="Security">
        <P>We implement industry-standard technical and organizational measures to protect your data, including:</P>
        <Ul>
          <Li>Encryption of data in transit (TLS 1.3) and at rest (AES-256).</Li>
          <Li>Role-based access controls limiting employee access to personal data.</Li>
          <Li>Regular third-party penetration testing and security audits.</Li>
          <Li>SOC 2 Type II certification (report available upon request to enterprise customers).</Li>
        </Ul>
        <P>
          No method of transmission over the internet is 100% secure. If we become aware of a data breach affecting your personal data, we will notify you within 72 hours of becoming aware, as required by applicable law.
        </P>
      </LegalSection>

      <LegalSection id="cookies" num="08" title="Cookies & tracking">
        <P>We use cookies and similar technologies to keep you signed in, remember your preferences, and understand how the Service is used. Categories:</P>
        <Ul>
          <Li><Strong>Essential cookies:</Strong> required for authentication and security. Cannot be disabled.</Li>
          <Li><Strong>Functional cookies:</Strong> remember your preferences (theme, language). Can be disabled in settings.</Li>
          <Li><Strong>Analytics cookies:</Strong> help us understand usage patterns using de-identified data. You can opt out.</Li>
        </Ul>
        <P>
          We do not use third-party advertising cookies. You can manage your cookie preferences at any time from the cookie settings link in the footer of the web application.
        </P>
      </LegalSection>

      <LegalSection id="your-rights" num="09" title="Your rights">
        <P>Depending on your location, you may have the following rights regarding your personal data:</P>
        <Ul>
          <Li><Strong>Access:</Strong> request a copy of the personal data we hold about you.</Li>
          <Li><Strong>Correction:</Strong> request that we correct inaccurate or incomplete data.</Li>
          <Li><Strong>Deletion:</Strong> request that we delete your personal data, subject to certain legal exceptions.</Li>
          <Li><Strong>Portability:</Strong> receive your data in a structured, machine-readable format.</Li>
          <Li><Strong>Restriction:</Strong> ask us to restrict processing of your data in certain circumstances.</Li>
          <Li><Strong>Objection:</Strong> object to processing based on legitimate interests.</Li>
          <Li><Strong>Withdraw consent:</Strong> where processing is based on consent, withdraw it at any time.</Li>
        </Ul>
        <P>
          To exercise any of these rights, contact us at <Strong>privacy@prizmsol.com</Strong>. We will respond within 30 days. EU/EEA users may also lodge a complaint with your local supervisory authority.
        </P>
      </LegalSection>

      <LegalSection id="children" num="10" title="Children's privacy">
        <P>
          The Service is not directed at children under the age of 13 (or 16 in the EEA/UK). We do not knowingly collect personal data from children. If you believe we have inadvertently collected data from a child, please contact us at <Strong>privacy@prizmsol.com</Strong> and we will promptly delete it.
        </P>
      </LegalSection>

      <LegalSection id="international" num="11" title="International transfers">
        <P>
          Prizmsol is headquartered in the United States. If you are accessing the Service from outside the US, your data may be transferred to and processed in the United States or other countries where our service providers operate.
        </P>
        <P>
          For transfers from the EEA, UK, or Switzerland, we rely on Standard Contractual Clauses approved by the European Commission. You may request a copy of these clauses at <Strong>legal@prizmsol.com</Strong>.
        </P>
      </LegalSection>

      <LegalSection id="changes" num="12" title="Changes to this policy">
        <P>
          We may update this Privacy Policy from time to time. When we make material changes, we will notify you by email or by posting a notice in the Service at least 14 days before the changes take effect. The "effective date" at the top of this page reflects when the current version came into force.
        </P>
      </LegalSection>

      <LegalSection id="contact" num="13" title="Contact us">
        <P>If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please reach out:</P>
        <div className="grid grid-cols-2 gap-2.5 mt-3">
          {[
            { label: "Privacy team", value: "privacy@prizmsol.com" },
            { label: "Data protection officer", value: "dpo@prizmsol.com" },
            { label: "Legal department", value: "legal@prizmsol.com" },
            { label: "Mailing address", value: "1209 Orange Street, Wilmington, DE 19801" },
          ].map(({ label, value }) => (
            <div key={label} className="bg-neutral-100 rounded-lg p-3">
              <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-medium mb-1">{label}</p>
              <p className="text-[13px] text-neutral-600">{value}</p>
            </div>
          ))}
        </div>
      </LegalSection>
    </LegalLayout>
  );
}