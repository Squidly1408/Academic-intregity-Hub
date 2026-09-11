import { LegalLayout, LegalSection } from "./LegalLayout";

export function PrivacyPolicy() {
  return (
    <LegalLayout eyebrow="Legal" title="Privacy Policy" updated="September 11, 2026">
      <p className="text-sm text-[var(--text-faint)]">
        This is a template policy describing how Academic Integrity Hub is built to handle data. It is provided for transparency and is not a
        substitute for legal advice — have counsel review it before relying on it for a commercial deployment.
      </p>

      <LegalSection title="1. What this service does">
        <p>
          Academic Integrity Hub lets you upload a document and returns an analysis covering AI-detection likelihood, plagiarism heuristics,
          citation verification, and writing quality. The service does not require an account, login, or payment.
        </p>
      </LegalSection>

      <LegalSection title="2. There is no server">
        <p>
          This app runs entirely in your browser. Your file is read, parsed, and scored on your own device — including AI-likelihood
          scoring, plagiarism heuristics, and writing analysis. That text is never uploaded to us; we have no server that receives it and
          nowhere it could be logged on our end.
        </p>
        <p>A few specific checks make targeted, key-less requests directly from your browser to public third-party APIs:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Short text snippets to LanguageTool's public API, for grammar checking.</li>
          <li>Short reference strings (not your whole document) to Crossref, OpenAlex, and Semantic Scholar, for citation and source verification.</li>
        </ul>
        <p>
          Each of those operates under its own privacy terms and may log the request on their end; we don't control their retention. If any
          of them is unreachable, the affected check falls back to a local-only result automatically.
        </p>
      </LegalSection>

      <LegalSection title="3. Storage and retention">
        <p>
          Your document and its report exist only in your browser's memory for the current session. Closing the tab or refreshing the page
          clears them — nothing is written to a database anywhere, because there is no backend to write to. Exported PDF, DOCX, or HTML
          reports are generated on your device and saved wherever your browser saves downloads.
        </p>
      </LegalSection>

      <LegalSection title="4. Cookies and analytics">
        <p>
          The app stores your theme and language preference in your browser's local storage. It also uses Google Analytics (via Google's
          gtag.js) to understand aggregate traffic to this site — this measures site usage, not the contents of anything you upload; your
          documents are never sent to Google or any analytics provider. See Google's own privacy policy for how it handles analytics data.
        </p>
      </LegalSection>

      <LegalSection title="5. Your choices">
        <p>
          Because no account is created, there is no profile to delete — closing the tab ends your session and there's nothing left on any
          server to remove. You can also block Google Analytics with a browser extension or privacy setting without affecting the app's
          functionality.
        </p>
      </LegalSection>

      <LegalSection title="6. Changes to this policy">
        <p>If this policy changes, the "last updated" date above will change with it.</p>
      </LegalSection>
    </LegalLayout>
  );
}
