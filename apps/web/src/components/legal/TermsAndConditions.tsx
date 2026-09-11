import { LegalLayout, LegalSection } from "./LegalLayout";

export function TermsAndConditions() {
  return (
    <LegalLayout eyebrow="Legal" title="Terms & Conditions" updated="September 11, 2026">
      <p className="text-sm text-[var(--text-faint)]">
        This is a template agreement. It is provided for transparency about intended use and is not a substitute for legal advice.
      </p>

      <LegalSection title="1. Acceptance">
        <p>By uploading a document or otherwise using Academic Integrity Hub, you agree to these terms.</p>
      </LegalSection>

      <LegalSection title="2. The service is provided as-is">
        <p>
          Academic Integrity Hub is a free analysis tool. AI-detection scores, plagiarism heuristics, citation checks, and writing-quality
          findings are automated estimates, not a determination of academic misconduct. They can be wrong, incomplete, or produce false
          positives and false negatives. Do not treat a report as proof of dishonesty, and do not use it as the sole basis for an academic
          or disciplinary decision.
        </p>
      </LegalSection>

      <LegalSection title="3. Your content">
        <p>
          You confirm you have the right to upload the document you submit. You retain ownership of anything you upload; using the
          service does not transfer any rights in your work to us.
        </p>
      </LegalSection>

      <LegalSection title="4. Acceptable use">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Don't upload content you don't have the right to share, or material containing others' private information without consent.</li>
          <li>Don't attempt to disrupt, overload, or reverse-engineer the service.</li>
          <li>Don't use the service to build a competing detection product from its outputs.</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Third-party providers">
        <p>
          Some findings are produced by third-party detection and citation APIs described in the Privacy Policy. We are not responsible
          for their availability, accuracy, or downtime; when a provider is unavailable, the report falls back to local heuristics and
          notes the change in coverage.
        </p>
      </LegalSection>

      <LegalSection title="6. No warranty, limited liability">
        <p>
          The service is provided "as is" without warranties of any kind. To the fullest extent permitted by law, the operator is not
          liable for damages arising from your use of, or inability to use, the service or its reports.
        </p>
      </LegalSection>

      <LegalSection title="7. Changes">
        <p>These terms may be updated from time to time; continued use after a change means you accept the revised terms.</p>
      </LegalSection>
    </LegalLayout>
  );
}
