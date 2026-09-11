export interface ProviderResult {
  provider: string;
  score: number;
  confidence: number;
  status: string;
  evidence: string;
}

export type HighlightSeverity = "info" | "low" | "medium" | "high";

export interface HighlightRange {
  start: number;
  end: number;
  category: string;
  severity: HighlightSeverity;
  label: string;
  suggestion?: string;
}

export interface AnalysisResult {
  overallScore: number;
  integrityRating: string;
  /** Sanitized primary-document text that every HighlightRange offset below is measured against. */
  documentText: string;
  ai: { score: number; summary: string; findings: HighlightRange[]; providers: ProviderResult[] };
  plagiarism: { score: number; summary: string; findings: HighlightRange[]; sources: Array<{ title: string; url: string; similarity: number }> };
  citations: { score: number; summary: string; findings: HighlightRange[]; citations: Array<{ raw: string; matched: boolean; issue?: string }> };
  writing: { score: number; summary: string; findings: HighlightRange[] };
  sourceVerification: { score: number; summary: string; findings: HighlightRange[]; matches: Array<{ provider: string; title: string; url: string; score: number; query: string; matched: boolean }> };
  styleConsistency: { score: number; summary: string; findings: HighlightRange[] };
  quoteIntegrity: { score: number; summary: string; findings: HighlightRange[] };
  readability: { score: number; summary: string; findings: HighlightRange[] };
  tone: { score: number; summary: string; findings: HighlightRange[] };
  hallucination: { score: number; summary: string; findings: HighlightRange[] };
  paraphrasing: { score: number; summary: string; findings: HighlightRange[] };
  sourceComparison: { score: number; summary: string; findings: HighlightRange[]; comparedAgainst: string[] };
  suggestions: string[];
  modules: Array<{ key: string; label: string; score: number; summary: string; category: "risk" | "quality" | "verification" }>;
  apiCoverage: Array<{ name: string; purpose: string; status: "live" | "fallback" | "mixed"; summary: string }>;
  charts: { labels: string[]; scores: number[] };
}

/** Local progress state for the in-browser analysis pipeline — there's no server job to poll. */
export interface AnalysisProgress {
  stage: "extracting" | "analyzing" | "done";
  progress: number;
  message: string;
}
