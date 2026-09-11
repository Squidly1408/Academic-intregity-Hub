import type { AnalysisResult } from "../../lib/types";
import { Card, Kicker } from "../ui";

export function SignalBreakdown({ result }: { result: AnalysisResult }) {
  return (
    <Card className="p-5">
      <Kicker>AI-likelihood signal breakdown</Kicker>
      <p className="mt-1 text-xs text-[var(--text-muted)]">
        Local, structural signals that combine into the AI risk score above — computed entirely in your browser, not a verdict from any
        third-party detector.
      </p>
      <div className="mt-4 space-y-3">
        {result.ai.providers.map((signal) => (
          <div key={signal.provider} className="well rounded-lg p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="font-medium text-[var(--text-primary)]">{signal.provider}</div>
              <div className="text-right">
                <div className="text-lg font-semibold text-[var(--accent-text)]">{signal.score}%</div>
                <div className="text-xs text-[var(--text-faint)]">Weight in score {signal.confidence}%</div>
              </div>
            </div>
            <div className="mt-3 text-sm text-[var(--text-secondary)]">{signal.evidence}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
