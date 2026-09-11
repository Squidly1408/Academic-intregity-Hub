<p align="center">
  <img src="assets/github/banner.png" alt="Academic Integrity Hub" width="640" />
</p>

<p align="center">A free, no-login, no-server academic document review: AI-detection likelihood, plagiarism heuristics, citation verification, and writing analysis, all computed in your browser.</p>

<p align="center"><a href="https://academic-integrity-hub.web.app"><strong>academic-integrity-hub.web.app</strong></a></p>

---

## What it is

Upload a document and Academic Integrity Hub walks it through three steps — **Upload → Analyze → Report** — combining several detection
signals into a single, exportable review:

- **AI-likelihood detection** from local structural-language signals (lexical variety, repetition, sentence rhythm, transition density) —
  computed entirely on your device, nothing is sent anywhere for this check
- **Plagiarism heuristics**: internal repetition analysis, and cross-document comparison when you upload more than one file
- **Grammar & style** via the public LanguageTool API plus structural sentence checks
- **Citation & source verification** against the public Crossref, OpenAlex, and Semantic Scholar catalogs
- **Style integrity**: burstiness, repetition, quote attribution, paraphrase drift
- A **highlighted copy of your document** with AI-style phrasing and possible plagiarism marked inline
- **HTML, PDF, and DOCX** report export — generated and downloaded on your device

No account, login, or payment is required. **There is no backend.** Your document is read, parsed (including PDF/DOCX/RTF/image-OCR
extraction), and scored entirely in your browser; the only network calls are the targeted, key-less lookups to the public APIs above,
each of which fails open to a local-only result if it's unreachable. See the in-app
[Privacy Policy](https://academic-integrity-hub.web.app/#/privacy) for details.

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite, TypeScript, Tailwind CSS, Framer Motion, Recharts |
| Text extraction | pdfjs-dist (PDF), mammoth (DOCX), tesseract.js (image OCR), all running client-side |
| Report export | jsPDF, docx, and a plain HTML template — generated client-side and downloaded directly |
| Hosting | Firebase Hosting — a static site, no server to run or pay for |

## Project structure

```
apps/
  web/   The app — everything above lives here
  api/   Legacy Express + Socket.IO backend, unused by the deployed site (see "About apps/api" below)
```

## Run locally

```bash
npm install                     # installs workspaces from the repo root
npm run dev --workspace @aih/web
```

Open the Vite URL printed in the terminal — that's the whole app, no other process required.

## Deployment

```bash
npm run build --workspace @aih/web
firebase deploy --only hosting
```

`firebase.json` and `.firebaserc` are already set up for this — `firebase.json` points at `apps/web/dist` and rewrites everything to
`index.html` for client-side routing.

## About `apps/api`

This app used to run its analysis on a server (`apps/api`, an Express + Socket.IO backend). It's still in the repo but the deployed
frontend no longer calls it — every check that server used to run now runs client-side instead (see `apps/web/src/lib/analysis.ts`,
`extract.ts`, and `report.ts`). The one thing a server made possible that the browser can't do safely is call paid AI-detection APIs
(Copyleaks, GPTZero, etc.) with a secret key — there's nowhere to hide a key in code that ships to every visitor, so those integrations
aren't used; AI-likelihood is local heuristics only, shown transparently as a signal breakdown rather than a vendor verdict. If you don't
need `apps/api`, it's safe to delete.

## Legal

In-app Privacy Policy and Terms & Conditions live at `#/privacy` and `#/terms` (see
[`apps/web/src/components/legal`](apps/web/src/components/legal)). They're templates describing how this codebase is built to handle
data — have them reviewed before relying on them for a public, commercial deployment.

## Notes

- Nothing about your document is stored anywhere — closing the tab clears it, because there's no server for it to persist on.
- The local analyzers are deterministic, so results are reproducible.
- Site analytics (Google Analytics) measure traffic only, never document contents.
