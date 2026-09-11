export type AnalysisMode = "single" | "compare";

export type AnalysisStatus = "queued" | "processing" | "completed" | "failed";

export type Severity = "info" | "low" | "medium" | "high";

export interface HighlightRange {
  start: number;
  end: number;
  category: string;
  severity: Severity;
  label: string;
  suggestion?: string;
}

export interface ProviderResult {
  provider: string;
  score: number;
  confidence: number;
  status: "success" | "fallback" | "error";
  evidence: string;
}

export interface SectionResult {
  score: number;
  summary: string;
  findings: HighlightRange[];
  details: Record<string, unknown>;
}

export interface AnalysisResult {
  overallScore: number;
  integrityRating: string;
  /** Sanitized primary-document text that every HighlightRange offset below is measured against. */
  documentText: string;
  ai: SectionResult & { providers: ProviderResult[] };
  plagiarism: SectionResult & { sources: Array<{ title: string; url: string; similarity: number }> };
  citations: SectionResult & { citations: Array<{ raw: string; matched: boolean; issue?: string }> };
  writing: SectionResult;
  sourceVerification: SectionResult & { matches: Array<{ provider: string; title: string; url: string; score: number; query: string; matched: boolean }> };
  styleConsistency: SectionResult;
  quoteIntegrity: SectionResult;
  readability: SectionResult;
  tone: SectionResult;
  hallucination: SectionResult;
  paraphrasing: SectionResult;
  sourceComparison: SectionResult & { comparedAgainst: string[] };
  suggestions: string[];
  modules: Array<{ key: string; label: string; score: number; summary: string; category: "risk" | "quality" | "verification" }>;
  apiCoverage: Array<{ name: string; purpose: string; status: "live" | "fallback" | "mixed"; summary: string }>;
  charts: {
    labels: string[];
    scores: number[];
  };
}

export interface UploadedFileInfo {
  originalName: string;
  mimeType: string;
  size: number;
  extractedText: string;
}

export interface AnalysisJob {
  id: string;
  status: AnalysisStatus;
  progress: number;
  message: string;
  createdAt: string;
  updatedAt: string;
  fileCount: number;
  files: UploadedFileInfo[];
  result?: AnalysisResult;
  error?: string;
}
