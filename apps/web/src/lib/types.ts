export interface ProviderResult {
  provider: string;
  score: number;
  confidence: number;
  status: string;
  evidence: string;
}

export interface AnalysisResult {
  overallScore: number;
  integrityRating: string;
  ai: { score: number; summary: string; providers: ProviderResult[] };
  plagiarism: { score: number; summary: string; sources: Array<{ title: string; url: string; similarity: number }> };
  citations: { score: number; summary: string; citations: Array<{ raw: string; matched: boolean; issue?: string }> };
  writing: { score: number; summary: string; suggestions: string[] };
  sourceVerification: { score: number; summary: string; matches: Array<{ provider: string; title: string; url: string; score: number; query: string; matched: boolean }> };
  styleConsistency: { score: number; summary: string };
  quoteIntegrity: { score: number; summary: string };
  readability: { score: number; summary: string };
  tone: { score: number; summary: string };
  hallucination: { score: number; summary: string };
  paraphrasing: { score: number; summary: string };
  sourceComparison: { score: number; summary: string; comparedAgainst: string[] };
  suggestions: string[];
  modules: Array<{ key: string; label: string; score: number; summary: string; category: "risk" | "quality" | "verification" }>;
  apiCoverage: Array<{ name: string; purpose: string; status: "live" | "fallback" | "mixed"; summary: string }>;
  charts: { labels: string[]; scores: number[] };
}

export interface JobPayload {
  id: string;
  status: "queued" | "processing" | "completed" | "failed";
  progress: number;
  message: string;
  result?: AnalysisResult;
  error?: string;
  fileCount: number;
}
