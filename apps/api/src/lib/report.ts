import PDFDocument from "pdfkit";
import { BorderStyle, Document, HeadingLevel, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType } from "docx";
import type { AnalysisJob, AnalysisResult } from "../types";

function escapeHtml(input: string): string {
  return input.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function buildHtmlReport(job: AnalysisJob, result: AnalysisResult): string {
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
    body{font-family:Arial,sans-serif;background:#06101d;color:#d7e4f2;margin:0;padding:32px}
    .sheet{max-width:980px;margin:0 auto;background:#0e1b2d;border-radius:24px;padding:32px;box-shadow:0 30px 80px rgba(0,0,0,.35)}
    h1,h2{color:#fff;margin-top:0} .meta{opacity:.8;margin-bottom:24px} .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:16px}
    .card{background:rgba(255,255,255,.06);padding:18px;border-radius:18px;border:1px solid rgba(255,255,255,.08)}
    .card span{display:block;font-size:12px;text-transform:uppercase;letter-spacing:.12em;opacity:.7;margin-bottom:12px}
    .card strong{font-size:28px;color:#7dd3fc} ul{line-height:1.7} .section{margin-top:28px;padding-top:28px;border-top:1px solid rgba(255,255,255,.08)}
  </style></head><body><div class="sheet"><h1>Academic Integrity Hub</h1><div class="meta">Report generated ${new Date().toLocaleString()} for ${escapeHtml(job.files.map((file) => file.originalName).join(", "))}</div><div class="grid">${cards}</div><div class="section"><h2>Top Recommendations</h2><ul>${suggestions}</ul></div><div class="section"><h2>Provider Summary</h2><p>${escapeHtml(result.ai.summary)}</p><p>${escapeHtml(result.plagiarism.summary)}</p><p>${escapeHtml(result.citations.summary)}</p></div></div></body></html>`;
}

export async function buildPdfReport(job: AnalysisJob, result: AnalysisResult): Promise<Buffer> {
  const doc = new PDFDocument({ margin: 42, size: "A4" });
  const chunks: Buffer[] = [];
  const completion = new Promise<Buffer>((resolve) => {
    doc.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  doc.fillColor("#04111f").rect(0, 0, doc.page.width, doc.page.height).fill();
  doc.fillColor("#ffffff").fontSize(24).text("Academic Integrity Hub", 42, 42);
  doc.fontSize(14).fillColor("#7dd3fc").text(`Integrity report for ${job.files.map((file) => file.originalName).join(", ")}`, 42, 80);
  doc.moveDown(2);

  const metrics = [
    ["Overall integrity", `${result.overallScore}%`],
    ["AI risk", `${result.ai.score}%`],
    ["Plagiarism", `${result.plagiarism.score}%`],
    ["Citation health", `${result.citations.score}%`],
    ["Writing", `${result.writing.score}%`],
    ["Readability", `${result.readability.score}%`]
  ];

  metrics.forEach(([label, value]) => {
    doc.fillColor("#94a3b8").fontSize(11).text(label);
    doc.fillColor("#ffffff").fontSize(17).text(value);
    doc.moveDown(0.8);
  });

  doc.moveDown();
  doc.fillColor("#7dd3fc").fontSize(16).text("Key recommendations");
  result.suggestions.forEach((suggestion) => doc.fillColor("#e2e8f0").fontSize(11).text(`• ${suggestion}`));

  doc.end();
  return completion;
}

export async function buildDocxReport(job: AnalysisJob, result: AnalysisResult): Promise<Buffer> {
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
          new Paragraph({ text: `Files: ${job.files.map((file) => file.originalName).join(", ")}` }),
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

  return Packer.toBuffer(doc);
}
