import * as pdfjsLib from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import mammoth from "mammoth";
import { createWorker } from "tesseract.js";
import { sanitizeText } from "./text";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp"];

async function extractFromPdf(buffer: ArrayBuffer): Promise<string> {
  const doc = await pdfjsLib.getDocument({ data: buffer }).promise;
  const pages: string[] = [];
  for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber += 1) {
    const page = await doc.getPage(pageNumber);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => ("str" in item ? item.str : "")).join(" ");
    pages.push(pageText);
  }
  return pages.join("\n\n");
}

async function extractFromDocx(buffer: ArrayBuffer): Promise<string> {
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  return result.value;
}

function extractFromRtf(buffer: ArrayBuffer): string {
  const raw = new TextDecoder("utf-8").decode(buffer);
  return raw
    .replace(/\\'[0-9a-f]{2}/gi, " ")
    .replace(/\\[a-z]+-?\d* ?/gi, " ")
    .replace(/[{}]/g, " ");
}

async function extractFromImage(file: File): Promise<string> {
  const worker = await createWorker("eng");
  try {
    const {
      data: { text }
    } = await worker.recognize(file);
    return text;
  } finally {
    await worker.terminate();
  }
}

/** Extracts plain text from an uploaded file entirely in the browser — nothing is sent anywhere for this step. */
export async function extractText(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  const mime = file.type;

  if (mime === "application/pdf" || name.endsWith(".pdf")) {
    const buffer = await file.arrayBuffer();
    return sanitizeText(await extractFromPdf(buffer));
  }

  if (name.endsWith(".docx")) {
    const buffer = await file.arrayBuffer();
    return sanitizeText(await extractFromDocx(buffer));
  }

  if (name.endsWith(".rtf") || mime.includes("rtf")) {
    const buffer = await file.arrayBuffer();
    return sanitizeText(extractFromRtf(buffer));
  }

  if (IMAGE_EXTENSIONS.some((extension) => name.endsWith(extension)) || mime.startsWith("image/")) {
    return sanitizeText(await extractFromImage(file));
  }

  return sanitizeText(await file.text());
}
