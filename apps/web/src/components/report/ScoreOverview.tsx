import type { AnalysisResult } from "../../lib/types";
import { MetricCard } from "../MetricCard";
import { toneForScore } from "../ui";

export function ScoreOverview({ result }: { result: AnalysisResult }) {
  const cards = [
    { label: "AI Score", value: `${result.ai.score}%`, tone: toneForScore(result.ai.score, true) },
    { label: "Plagiarism Score", value: `${result.plagiarism.score}%`, tone: toneForScore(result.plagiarism.score, true) },
    { label: "Citation Health", value: `${result.citations.score}%`, tone: toneForScore(result.citations.score) },
    { label: "Source Verification", value: `${result.sourceVerification.score}%`, tone: toneForScore(result.sourceVerification.score) },
    { label: "Style Consistency", value: `${result.styleConsistency.score}%`, tone: toneForScore(result.styleConsistency.score) },
    { label: "Quote Integrity", value: `${result.quoteIntegrity.score}%`, tone: toneForScore(result.quoteIntegrity.score) },
    { label: "Grammar Score", value: `${result.writing.score}%`, tone: toneForScore(result.writing.score) },
    { label: "Readability", value: `${result.readability.score}%`, tone: toneForScore(result.readability.score) }
  ] as const;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <MetricCard key={card.label} label={card.label} value={card.value} tone={card.tone === "neutral" ? "info" : card.tone} />
      ))}
    </div>
  );
}
