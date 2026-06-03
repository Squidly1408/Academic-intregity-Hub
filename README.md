# Academic Integrity Hub

Academic Integrity Hub is a free-to-use, no-login, privacy-first academic analysis platform. Users upload documents directly on the homepage and receive an immediate integrity report that combines AI detection, plagiarism heuristics, citation checks, writing analysis, OCR extraction, and exportable reports.

## Stack

- Frontend: React, Vite, TypeScript, TailwindCSS, Framer Motion, Recharts
- Backend: Node.js, Express, TypeScript, Socket.IO
- Processing: In-memory queue with parallel analysis and provider fallback logic
- Export: HTML, PDF, and DOCX
- Deployment: Docker-ready for containerized hosting

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Start the full app:

```bash
npm run dev
```

3. Open the frontend at the Vite URL shown in the terminal.

The API runs on port `8787` and the web app runs on port `5173` by default.

## Environment

Copy `.env.example` to `.env` if you want to configure optional provider keys.

The app works without external API keys by falling back to local heuristics, so it remains usable out of the box.

## Features

- Drag-and-drop upload from the landing page
- PDF, DOCX, TXT, RTF, and image OCR support
- Parallel analysis providers with graceful fallback
- Real-time job progress via WebSocket
- Integrity dashboard with charts and recommendation cards
- HTML, PDF, and DOCX report export
- No account, login, password, or subscription required

## Docker

Build and run with Docker Compose:

```bash
docker compose up --build
```

## Notes

- Uploads are handled in memory and are not persisted by default.
- Real third-party provider integrations are enabled by environment variables.
- The local analyzers are deterministic so the app remains functional without paid services.
