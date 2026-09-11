import type { AnalysisResult } from "../../lib/types";
import { Card, Kicker, Pill } from "../ui";

export function ApiCoverage({ result }: { result: AnalysisResult }) {
  return (
    <Card className="p-5">
      <Kicker>Public API coverage</Kicker>
      <div className="mt-4 space-y-3">
        {result.apiCoverage.map((api) => (
          <div key={api.name} className="well rounded-lg p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="font-medium text-[var(--text-primary)]">{api.name}</div>
                <div className="text-xs uppercase tracking-[0.14em] text-[var(--text-faint)]">{api.purpose}</div>
              </div>
              <Pill tone={api.status === "live" ? "good" : api.status === "mixed" ? "info" : "warn"}>{api.status}</Pill>
            </div>
            <div className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{api.summary}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
