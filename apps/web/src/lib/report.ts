import { BorderStyle, Document, HeadingLevel, Packer, Paragraph, Table, TableCell, TableRow, WidthType } from "docx";
import { jsPDF } from "jspdf";
import type { AnalysisResult } from "./types";

function escapeHtml(input: string): string {
  return input.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function buildHtmlReport(fileNames: string[], result: AnalysisResult): string {
  const cards = [
    ["Integrity", result.integrityRating],
    ["AI Risk", `${result.ai.score}%`],
    ["Plagiarism", `${result.plagiarism.score}%`],
    ["Citation Health", `${result.citations.score}%`],
    ["Writing", `${result.writing.score}%`],
    ["Readability", `${result.readability.score}%`]
  ]
    .map(([label, value]) => `<div class="card"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`)
    .join("");

  const suggestions = result.suggestions.map((item) => `<li>${escapeHtml(item)}</li>`).join("");

  return `<!doctype html><html><head><meta charset="utf-8"><title>Academic Integrity Hub Report</title><style>
    body{font-family:Georgia,serif;background:#faf7f1;color:#1c1a16;margin:0;padding:32px}
    .sheet{max-width:980px;margin:0 auto;background:#fff;border-radius:16px;padding:32px;border:1px solid rgba(28,25,20,.12)}
    h1,h2{margin-top:0} .meta{opacity:.7;margin-bottom:24px} .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:16px}
    .card{background:#f2ede1;padding:18px;border-radius:12px;border:1px solid rgba(28,25,20,.12)}
    .card span{display:block;font-size:12px;text-transform:uppercase;letter-spacing:.12em;opacity:.6;margin-bottom:12px}
    .card strong{font-size:28px;color:#23345c} ul{line-height:1.7} .section{margin-top:28px;padding-top:28px;border-top:1px solid rgba(28,25,20,.12)}
  </style></head><body><div class="sheet"><h1>Academic Integrity Hub</h1><div class="meta">Report generated ${new Date().toLocaleString()} for ${escapeHtml(fileNames.join(", "))} — generated entirely in your browser.</div><div class="grid">${cards}</div><div class="section"><h2>Top Recommendations</h2><ul>${suggestions}</ul></div><div class="section"><h2>Summary</h2><p>${escapeHtml(result.ai.summary)}</p><p>${escapeHtml(result.plagiarism.summary)}</p><p>${escapeHtml(result.citations.summary)}</p></div></div></body></html>`;
}

export function downloadHtmlReport(fileNames: string[], result: AnalysisResult) {
  const html = buildHtmlReport(fileNames, result);
  downloadBlob(new Blob([html], { type: "text/html" }), "academic-integrity-report.html");
}

export function downloadPdfReport(fileNames: string[], result: AnalysisResult) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor("#161512");
  doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), "F");
  doc.setTextColor("#f3efe4");
  doc.setFontSize(22);
  doc.text("Academic Integrity Hub", 42, 50);
  doc.setFontSize(12);
  doc.setTextColor("#9fb1de");
  doc.text(`Integrity report for ${fileNames.join(", ")}`, 42, 72, { maxWidth: pageWidth - 84 });

  let y = 110;
  const metrics: Array<[string, string]> = [
    ["Overall integrity", `${result.overallScore}%`],
    ["AI risk", `${result.ai.score}%`],
    ["Plagiarism", `${result.plagiarism.score}%`],
    ["Citation health", `${result.citations.score}%`],
    ["Writing", `${result.writing.score}%`],
    ["Readability", `${result.readability.score}%`]
  ];

  metrics.forEach(([label, value]) => {
    doc.setFontSize(10);
    doc.setTextColor("#b7ae9a");
    doc.text(label, 42, y);
    doc.setFontSize(15);
    doc.setTextColor("#f3efe4");
    doc.text(value, 42, y + 18);
    y += 38;
  });

  y += 10;
  doc.setFontSize(14);
  doc.setTextColor("#9fb1de");
  doc.text("Key recommendations", 42, y);
  y += 20;
  doc.setFontSize(10);
  doc.setTextColor("#e5ded0");
  result.suggestions.forEach((suggestion) => {
    const lines = doc.splitTextToSize(`• ${suggestion}`, pageWidth - 84);
    doc.text(lines, 42, y);
    y += lines.length * 14 + 6;
  });

  doc.save("academic-integrity-report.pdf");
}

export async function downloadDocxReport(fileNames: string[], result: AnalysisResult) {
  const tableRows = [
    ["Overall integrity", `${result.overallScore}%`],
    ["AI risk", `${result.ai.score}%`],
    ["Plagiarism", `${result.plagiarism.score}%`],
    ["Citation health", `${result.citations.score}%`]
  ].map(([label, value]) => new TableRow({ children: [new TableCell({ children: [new Paragraph(label)] }), new TableCell({ children: [new Paragraph(value)] })] }));

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({ text: "Academic Integrity Hub", heading: HeadingLevel.TITLE }),
          new Paragraph({ text: `Report timestamp: ${new Date().toLocaleString()}` }),
          new Paragraph({ text: `Files: ${fileNames.join(", ")}` }),
          new Paragraph({ text: "Summary", heading: HeadingLevel.HEADING_1 }),
          new Paragraph(result.ai.summary),
          new Paragraph(result.plagiarism.summary),
          new Paragraph(result.citations.summary),
          new Paragraph({ text: "Scores", heading: HeadingLevel.HEADING_1 }),
          new Table({
            rows: tableRows,
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: "D1D5DB" },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: "D1D5DB" },
              left: { style: BorderStyle.SINGLE, size: 1, color: "D1D5DB" },
              right: { style: BorderStyle.SINGLE, size: 1, color: "D1D5DB" },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "D1D5DB" },
              insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "D1D5DB" }
            }
          }),
          new Paragraph({ text: "Recommendations", heading: HeadingLevel.HEADING_1 }),
          ...result.suggestions.map((suggestion) => new Paragraph({ text: suggestion, bullet: { level: 0 } }))
        ]
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, "academic-integrity-report.docx");
}
