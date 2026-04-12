import LegalLayout, { Section } from "@/components/LegalLayout";
import { LegalSection, P, Ul, Li, Callout, Strong, SubHeading } from "@/components/LegalSection";

const sections: Section[] = [
  { id: "acceptance", label: "Acceptance of terms" },
  { id: "service", label: "Description of service" },
  { id: "eligibility", label: "Eligibility" },
  { id: "account", label: "Account registration" },
  { id: "acceptable-use", label: "Acceptable use" },
  { id: "agent-behavior", label: "Agent behavior & limits" },
  { id: "data", label: "User data & privacy" },
  { id: "ip", label: "Intellectual property" },
  { id: "fees", label: "Fees & billing" },
  { id: "disclaimers", label: "Disclaimers" },
  { id: "liability", label: "Limitation of liability" },
  { id: "termination", label: "Termination" },
  { id: "governing-law", label: "Governing law" },
  { id: "changes", label: "Changes to these terms" },
  { id: "contact", label: "Contact us" },
];

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms of service"
      subtitle="Prizmsol AI agent platform"
      effectiveDate="April 11, 2026"
      version="2.0"
      currentPage="terms"
      summary="These terms govern your use of Prizmsol, an AI agent that autonomously researches, plans, and executes multi-step tasks on your behalf. By using Prizmsol, you agree to use it responsibly, take ownership of actions the agent performs at your direction, and accept that outputs should be reviewed before use in high-stakes situations."
      sections={sections}
    >
      <LegalSection id="acceptance" num="01" title="Acceptance of terms">
        <P>
          By creating an account, accessing, or using the Prizmsol AI platform ("Service"), you agree to be legally bound by these Terms of Service ("Terms") and our Privacy Policy. If you are accessing the Service on behalf of an organization, you represent that you have the authority to bind that organization to these Terms.
        </P>
        <P>
          If you do not agree with any part of these Terms, you must immediately discontinue your use of the Service.
        </P>
      </LegalSection>

      <LegalSection id="service" num="02" title="Description of service">
        <P>
          Prizmsol is an AI-powered autonomous agent platform that accepts natural-language instructions and independently executes multi-step tasks including, but not limited to: research and information synthesis, document drafting and editing, data analysis, workflow orchestration, and third-party service coordination on your behalf.
        </P>
        <P>
          The Service includes a web interface, API access, and integrations with external tools. Certain features are gated behind subscription tiers as described in our pricing documentation.
        </P>
        <Callout>
          Prizmsol is a tool, not a legal, financial, or professional advisor. Outputs produced by the agent should be reviewed carefully before use in regulated, high-stakes, or consequential contexts.
        </Callout>
      </LegalSection>

      <LegalSection id="eligibility" num="03" title="Eligibility">
        <P>
          You must be at least 18 years of age to use the Service. By using Prizmsol, you represent and warrant that you meet this age requirement and that you are not located in a jurisdiction where AI agent services are prohibited by local law.
        </P>
        <P>
          Business accounts require that the signatory has legal authority to enter into contracts on behalf of the entity.
        </P>
      </LegalSection>

      <LegalSection id="account" num="04" title="Account registration">
        <P>
          To access the Service, you must register for an account by providing accurate and complete information. You are responsible for:
        </P>
        <Ul>
          <Li>Maintaining the confidentiality of your account credentials and API keys.</Li>
          <Li>All activity that occurs under your account, including actions taken by the agent at your direction.</Li>
          <Li>Promptly notifying us at <Strong>security@prizmsol.com</Strong> if you suspect unauthorized access to your account.</Li>
        </Ul>
        <P>
          We reserve the right to suspend or terminate accounts that provide false information or that we reasonably believe are being used fraudulently.
        </P>
      </LegalSection>

      <LegalSection id="acceptable-use" num="05" title="Acceptable use policy">
        <P>You agree not to use the Service, or instruct the agent to:</P>
        <Ul>
          <Li>Violate any applicable local, national, or international law or regulation.</Li>
          <Li>Generate, transmit, or store content that is unlawful, defamatory, harassing, threatening, or fraudulent.</Li>
          <Li>Attempt to circumvent security measures, access systems without authorization, or engage in any form of cyberattack.</Li>
          <Li>Scrape, harvest, or mass-extract data from websites or services in violation of their terms.</Li>
          <Li>Impersonate any person or entity, or misrepresent your affiliation with any person or entity.</Li>
          <Li>Reproduce, distribute, or sell outputs from the Service as a competing AI product without our written consent.</Li>
          <Li>Interfere with or disrupt the integrity or performance of the Service or its underlying infrastructure.</Li>
        </Ul>
        <P>Violations of this policy may result in immediate suspension or permanent termination of your account.</P>
      </LegalSection>

      <LegalSection id="agent-behavior" num="06" title="Agent behavior & limitations">
        <P>
          Prizmsol operates by interpreting your instructions and autonomously deciding how to achieve your stated goals. By directing the agent, you acknowledge and accept that:
        </P>
        <Ul>
          <Li><Strong>You bear responsibility for instructions given.</Strong> You are responsible for the tasks you assign the agent and for verifying the agent's outputs before acting on them.</Li>
          <Li><Strong>The agent may make mistakes.</Strong> AI agents can misinterpret instructions, produce inaccurate information, or take unintended intermediate steps. Always review consequential outputs.</Li>
          <Li><Strong>Third-party actions are your responsibility.</Strong> When you grant the agent access to external accounts, APIs, or services, any actions taken through those integrations are performed on your behalf and at your direction.</Li>
          <Li><Strong>The agent does not retain memory between sessions</Strong> unless you explicitly enable memory features in your account settings.</Li>
        </Ul>
        <Callout>
          Do not grant the agent access to accounts or systems where unintended actions could cause irreversible harm. Always maintain a human-in-the-loop for high-consequence decisions.
        </Callout>
      </LegalSection>

      <LegalSection id="data" num="07" title="User data & privacy">
        <P>
          Your use of the Service is subject to our Privacy Policy, which is incorporated into these Terms by reference. By using the Service, you consent to the collection and use of your data as described in that policy.
        </P>
        <P>
          You retain ownership of any data you submit to the Service. You grant us a limited, non-exclusive license to process your data solely for the purpose of providing and improving the Service.
        </P>
      </LegalSection>

      <LegalSection id="ip" num="08" title="Intellectual property">
        <P>
          The Service, including its software, design, trademarks, and documentation, is owned by Prizmsol Technologies, Inc. and is protected by applicable intellectual property laws. These Terms do not grant you any rights to our intellectual property except as expressly stated herein.
        </P>
        <P>
          You retain ownership of content you create using the Service. However, you represent and warrant that you have the rights to any content you submit to the agent and that such content does not infringe any third-party rights.
        </P>
      </LegalSection>

      <LegalSection id="fees" num="09" title="Fees & billing">
        <P>
          Access to the Service may require a paid subscription. Fees are described on our pricing page and are subject to change with 30 days' notice. All fees are non-refundable except as required by applicable law or as explicitly stated in our refund policy.
        </P>
        <Ul>
          <Li>Subscriptions renew automatically unless cancelled before the renewal date.</Li>
          <Li>Usage-based charges are calculated at the end of each billing cycle.</Li>
          <Li>We reserve the right to suspend access for overdue payments after a 7-day grace period.</Li>
        </Ul>
      </LegalSection>

      <LegalSection id="disclaimers" num="10" title="Disclaimers">
        <P>
          THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED BY LAW, Prizmsol TECHNOLOGIES, INC. DISCLAIMS ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
        </P>
        <P>
          We do not warrant that the Service will be uninterrupted, error-free, or free of harmful components. We do not guarantee the accuracy, completeness, or reliability of any outputs produced by the agent.
        </P>
      </LegalSection>

      <LegalSection id="liability" num="11" title="Limitation of liability">
        <P>
          TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, Prizmsol TECHNOLOGIES, INC. SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
        </P>
        <P>
          Our total liability to you for any claims arising out of or related to these Terms or the Service shall not exceed the greater of (a) the amount you paid us in the 12 months preceding the claim, or (b) $100 USD.
        </P>
      </LegalSection>

      <LegalSection id="termination" num="12" title="Termination">
        <P>
          You may terminate your account at any time by contacting us at <Strong>support@prizmsol.com</Strong> or through your account settings. We may suspend or terminate your access to the Service at any time, with or without cause, with or without notice.
        </P>
        <P>
          Upon termination, your right to use the Service immediately ceases. Provisions that by their nature should survive termination — including intellectual property, disclaimers, and limitation of liability clauses — shall survive.
        </P>
      </LegalSection>

      <LegalSection id="governing-law" num="13" title="Governing law">
        <P>
          These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law provisions. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts located in Wilmington, Delaware.
        </P>
        <P>
          If you are a consumer in the European Union, you may also be entitled to protections under the laws of your country of residence.
        </P>
      </LegalSection>

      <LegalSection id="changes" num="14" title="Changes to these terms">
        <P>
          We may update these Terms from time to time. When we make material changes, we will notify you by email or by posting a prominent notice in the Service at least 14 days before the changes take effect. Your continued use of the Service after that date constitutes acceptance of the revised Terms.
        </P>
      </LegalSection>

      <LegalSection id="contact" num="15" title="Contact us">
        <P>If you have any questions about these Terms, please contact us:</P>
        <div className="grid grid-cols-2 gap-2.5 mt-3">
          {[
            { label: "General inquiries", value: "hello@prizmsol.com" },
            { label: "Legal department", value: "legal@prizmsol.com" },
            { label: "Security issues", value: "security@prizmsol.com" },
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