import mammoth from "mammoth";
import pdf from "pdf-parse";
import Tesseract from "tesseract.js";
import { sanitizeText } from "./text";

export interface MemoryUpload {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

export async function extractText(upload: MemoryUpload): Promise<string> {
  const name = upload.originalname.toLowerCase();
  const mime = upload.mimetype;

  if (mime === "application/pdf" || name.endsWith(".pdf")) {
    const parsed = await pdf(upload.buffer);
    return sanitizeText(parsed.text);
  }

  if (name.endsWith(".docx")) {
    const parsed = await mammoth.extractRawText({ buffer: upload.buffer });
    return sanitizeText(parsed.value);
  }

  if (name.endsWith(".rtf") || mime.includes("rtf")) {
    return sanitizeText(upload.buffer.toString("utf8").replace(/\\'[0-9a-f]{2}/gi, " ").replace(/\\[a-z]+-?\d* ?/gi, " ").replace(/[{}]/g, " "));
  }

  if (name.endsWith(".png") || name.endsWith(".jpg") || name.endsWith(".jpeg") || name.endsWith(".webp") || mime.startsWith("image/")) {
    const result = await Tesseract.recognize(upload.buffer, "eng");
    return sanitizeText(result.data.text);
  }

  return sanitizeText(upload.buffer.toString("utf8"));
}
