import path from "node:path";

const allowedExtensions = new Set([".pdf", ".docx", ".txt", ".rtf", ".png", ".jpg", ".jpeg", ".webp"]);
const allowedMimeTypes = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "application/rtf",
  "text/rtf",
  "image/png",
  "image/jpeg",
  "image/webp"
]);

export function assertSafeUpload(fileName: string, mimeType: string, size: number, maxSizeBytes: number): void {
  const extension = path.extname(fileName).toLowerCase();
  if (!allowedExtensions.has(extension)) {
    throw new Error(`Unsupported file type: ${extension || "unknown"}`);
  }

  if (!allowedMimeTypes.has(mimeType)) {
    throw new Error(`Unsupported mime type: ${mimeType}`);
  }

  if (size > maxSizeBytes) {
    throw new Error(`File exceeds the ${Math.round(maxSizeBytes / 1024 / 1024)}MB limit`);
  }
}

export function detectSuspiciousPatterns(text: string): string[] {
  const issues: string[] = [];
  if (/eval\(|<script|javascript:/i.test(text)) {
    issues.push("Potential script injection pattern detected in extracted content");
  }
  if (/\.{20,}/.test(text)) {
    issues.push("Unusually long punctuation runs detected");
  }
  if (/\b(?:lorem ipsum|asdf|qwerty)\b/i.test(text)) {
    issues.push("Placeholder text detected");
  }
  return issues;
}
