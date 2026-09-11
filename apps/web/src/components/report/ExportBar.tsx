import { useState } from "react";
import type { AnalysisResult } from "../../lib/types";
import { downloadDocxReport, downloadHtmlReport, downloadPdfReport } from "../../lib/report";
import { DownloadIcon } from "../icons";
import { Button, Card, Kicker } from "../ui";

export function ExportBar({ result, fileNames }: { result: AnalysisResult; fileNames: string[] }) {
  const [busy, setBusy] = useState<"pdf" | "docx" | "html" | null>(null);

  async function handleExport(format: "pdf" | "docx" | "html") {
    setBusy(format);
    try {
      if (format === "pdf") downloadPdfReport(fileNames, result);
      else if (format === "html") downloadHtmlReport(fileNames, result);
      else await downloadDocxReport(fileNames, result);
    } finally {
      setBusy(null);
    }
  }

  return (
    <Card className="p-5">
      <Kicker>Export</Kicker>
      <div className="mt-3 flex flex-wrap gap-2.5">
        <Button variant="primary" size="sm" onClick={() => handleExport("pdf")} disabled={busy !== null}>
          <DownloadIcon className="h-3.5 w-3.5" /> {busy === "pdf" ? "Preparing…" : "PDF"}
        </Button>
        <Button variant="secondary" size="sm" onClick={() => handleExport("docx")} disabled={busy !== null}>
          <DownloadIcon className="h-3.5 w-3.5" /> {busy === "docx" ? "Preparing…" : "DOCX"}
        </Button>
        <Button variant="secondary" size="sm" onClick={() => handleExport("html")} disabled={busy !== null}>
          <DownloadIcon className="h-3.5 w-3.5" /> {busy === "html" ? "Preparing…" : "HTML"}
        </Button>
      </div>
      <div className="mt-3 text-xs text-[var(--text-muted)]">Reports are generated on your device and download directly — nothing is uploaded to produce them.</div>
    </Card>
  );
}
