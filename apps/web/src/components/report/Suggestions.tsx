import type { AnalysisResult } from "../../lib/types";
import { Card, Kicker } from "../ui";

export function Suggestions({ result }: { result: AnalysisResult }) {
  return (
    <Card className="p-5">
      <Kicker>Top recommendations</Kicker>
      <div className="mt-4 space-y-2.5 text-sm leading-6 text-[var(--text-secondary)]">
        {result.suggestions.map((suggestion) => (
          <div key={suggestion} className="well rounded-lg p-4">
            {suggestion}
          </div>
        ))}
      </div>
    </Card>
  );
}
