import { extractText } from "./extract";
import { runAnalysis } from "./analysis";
import type { AnalysisProgress, AnalysisResult } from "./types";

/**
 * The whole analysis pipeline runs locally in the browser — there is no
 * server. Files are read and parsed on-device; the only network calls are
 * the targeted, key-less public API lookups inside `runAnalysis` (grammar
 * and citation verification), each of which fails open to a local-only
 * result if unreachable.
 */
export async function runAnalysisPipeline(files: File[], language: string, onProgress: (progress: AnalysisProgress) => void): Promise<AnalysisResult> {
  const extracted: Array<{ name: string; extractedText: string }> = [];

  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    onProgress({
      stage: "extracting",
      progress: Math.round((index / files.length) * 45),
      message: `Reading ${file.name}…`
    });
    const extractedText = await extractText(file);
    extracted.push({ name: file.name, extractedText });
  }

  onProgress({ stage: "analyzing", progress: 55, message: "Running detection and verification checks…" });

  const result = await runAnalysis({ files: extracted, language });

  onProgress({ stage: "done", progress: 100, message: "Report ready." });

  return result;
}
