import type { AnalysisResult } from "../../lib/types";
import { BoltIcon, GlobeIcon, ShieldIcon, SparkIcon } from "../icons";
import { Card, Kicker, ProgressBar } from "../ui";

const categoryMeta: Record<string, { label: string; Icon: typeof ShieldIcon }> = {
  risk: { label: "Risk", Icon: BoltIcon },
  quality: { label: "Quality", Icon: SparkIcon },
  verification: { label: "Verification", Icon: GlobeIcon }
};

export function ModuleGrid({ result }: { result: AnalysisResult }) {
  return (
    <Card className="p-5">
      <Kicker>Detection modules</Kicker>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {result.modules.map((module) => {
          const meta = categoryMeta[module.category] ?? categoryMeta.quality;
          const { Icon } = meta;
          return (
            <div key={module.key} className="well rounded-lg p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--accent-soft-bg)] text-[var(--accent-text)]">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <div className="font-medium text-[var(--text-primary)]">{module.label}</div>
                    <div className="text-xs uppercase tracking-[0.14em] text-[var(--text-faint)]">{meta.label}</div>
                  </div>
                </div>
                <div className="text-lg font-semibold text-[var(--accent-text)]">{module.score}%</div>
              </div>
              <ProgressBar value={module.score} className="mt-3" />
              <div className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{module.summary}</div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
