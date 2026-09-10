import { motion } from "framer-motion";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell, Legend } from "recharts";
import type { AnalysisResult } from "../lib/types";
import { MetricCard } from "./MetricCard";
import { BoltIcon, GlobeIcon, ShieldIcon, SparkIcon } from "./icons";

const seriesColors = ["var(--series-1)", "var(--series-2)", "var(--series-3)", "var(--series-4)", "var(--series-5)", "var(--series-6)", "var(--series-7)", "var(--series-8)"];

const categoryMeta: Record<string, { label: string; Icon: typeof ShieldIcon }> = {
  risk: { label: "Risk", Icon: BoltIcon },
  quality: { label: "Quality", Icon: SparkIcon },
  verification: { label: "Verification", Icon: GlobeIcon }
};

const tooltipStyle = {
  background: "var(--chart-tooltip-bg)",
  border: "1px solid var(--chart-tooltip-border)",
  borderRadius: 12,
  color: "var(--text-primary)",
  fontSize: 13
};

interface AnalysisDashboardProps {
  result?: AnalysisResult;
  isProcessing?: boolean;
}

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-2xl ${className}`} />;
}

function LoadingState() {
  return (
    <div className="space-y-6" aria-live="polite" aria-busy="true">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <SkeletonBlock key={index} className="h-32" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <SkeletonBlock className="h-80" />
        <SkeletonBlock className="h-80" />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="glass flex min-h-[22rem] flex-col items-center justify-center gap-4 rounded-[2rem] p-10 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-full border border-[var(--border)] bg-[var(--surface-3)] text-[var(--accent-text)]">
        <SparkIcon className="h-7 w-7" />
      </div>
      <div className="text-lg font-semibold text-[var(--text-primary)]">Your report will appear here</div>
      <p className="max-w-md text-sm leading-6 text-[var(--text-muted)]">
        Upload a document above to see AI detection, plagiarism heuristics, citation checks, and style analysis laid out as a full dashboard.
      </p>
    </div>
  );
}

export function AnalysisDashboard({ result, isProcessing }: AnalysisDashboardProps) {
  if (!result) {
    return isProcessing ? <LoadingState /> : <EmptyState />;
  }

  const cards = [
    { label: "AI Score", value: `${result.ai.score}%`, tone: result.ai.score > 75 ? ("bad" as const) : ("warn" as const) },
    { label: "Plagiarism Score", value: `${result.plagiarism.score}%`, tone: result.plagiarism.score < 70 ? ("warn" as const) : ("good" as const) },
    { label: "Citation Health", value: `${result.citations.score}%`, tone: result.citations.score < 75 ? ("warn" as const) : ("good" as const) },
    { label: "Source Verification", value: `${result.sourceVerification.score}%`, tone: result.sourceVerification.score > 70 ? ("good" as const) : ("warn" as const) },
    { label: "Style Consistency", value: `${result.styleConsistency.score}%`, tone: result.styleConsistency.score > 80 ? ("good" as const) : ("warn" as const) },
    { label: "Quote Integrity", value: `${result.quoteIntegrity.score}%`, tone: result.quoteIntegrity.score > 80 ? ("good" as const) : ("warn" as const) },
    { label: "Grammar Score", value: `${result.writing.score}%`, tone: result.writing.score > 85 ? ("good" as const) : ("warn" as const) },
    { label: "Readability", value: `${result.readability.score}%`, tone: result.readability.score > 70 ? ("good" as const) : ("warn" as const) },
    { label: "Integrity Rating", value: result.integrityRating, tone: "info" as const }
  ];

  const chartData = result.charts.labels.map((label, index) => ({ label, value: result.charts.scores[index] }));

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {cards.map((card, index) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.04 }}>
            <MetricCard label={card.label} value={card.value} tone={card.tone} />
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <div className="glass rounded-[2rem] p-5">
          <div className="mb-4 text-sm uppercase tracking-[0.24em] text-[var(--text-muted)]">Signal map</div>
          <div className="h-80 w-full">
            <ResponsiveContainer>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="analysisGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--series-1)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="var(--series-1)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis dataKey="label" tick={{ fill: "var(--chart-axis)", fontSize: 12 }} />
                <YAxis tick={{ fill: "var(--chart-axis)", fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="value" stroke="var(--series-1)" fill="url(#analysisGradient)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-[2rem] p-5">
          <div className="mb-4 text-sm uppercase tracking-[0.24em] text-[var(--text-muted)]">Risk distribution</div>
          <div className="h-80 w-full">
            <ResponsiveContainer>
              <PieChart>
                <Pie dataKey="value" data={chartData.map((point) => ({ name: point.label, value: point.value }))} innerRadius={65} outerRadius={105} paddingAngle={2} stroke="var(--surface-solid)" strokeWidth={2}>
                  {chartData.map((_, index) => (
                    <Cell key={index} fill={seriesColors[index % seriesColors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ color: "var(--text-muted)", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="glass rounded-[2rem] p-5">
          <div className="mb-4 text-sm uppercase tracking-[0.24em] text-[var(--text-muted)]">Top recommendations</div>
          <div className="space-y-3 text-sm leading-6 text-[var(--text-secondary)]">
            {result.suggestions.map((suggestion) => (
              <div key={suggestion} className="chip rounded-2xl p-4">
                {suggestion}
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-[2rem] p-5">
          <div className="mb-4 text-sm uppercase tracking-[0.24em] text-[var(--text-muted)]">Provider comparison</div>
          <div className="space-y-3">
            {result.ai.providers.map((provider) => (
              <div key={provider.provider} className="chip rounded-2xl p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-medium text-[var(--text-primary)]">{provider.provider}</div>
                    <div className="text-xs uppercase tracking-[0.18em] text-[var(--text-faint)]">{provider.status}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-[var(--accent-text)]">{provider.score}%</div>
                    <div className="text-xs text-[var(--text-faint)]">Confidence {provider.confidence}%</div>
                  </div>
                </div>
                <div className="mt-3 text-sm text-[var(--text-secondary)]">{provider.evidence}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="glass rounded-[2rem] p-5">
          <div className="mb-4 text-sm uppercase tracking-[0.24em] text-[var(--text-muted)]">Detection modules</div>
          <div className="grid gap-3 md:grid-cols-2">
            {result.modules.map((module) => {
              const meta = categoryMeta[module.category] ?? categoryMeta.quality;
              const { Icon } = meta;
              return (
                <div key={module.key} className="chip rounded-2xl p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--accent-soft-bg)] text-[var(--accent-text)]">
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <div>
                        <div className="font-medium text-[var(--text-primary)]">{module.label}</div>
                        <div className="text-xs uppercase tracking-[0.18em] text-[var(--text-faint)]">{meta.label}</div>
                      </div>
                    </div>
                    <div className="text-lg font-semibold text-[var(--accent-text)]">{module.score}%</div>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--surface-4)]">
                    <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-500" style={{ width: `${module.score}%` }} />
                  </div>
                  <div className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{module.summary}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass rounded-[2rem] p-5">
          <div className="mb-4 text-sm uppercase tracking-[0.24em] text-[var(--text-muted)]">Public API coverage</div>
          <div className="space-y-3">
            {result.apiCoverage.map((api) => (
              <div key={api.name} className="chip rounded-2xl p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-medium text-[var(--text-primary)]">{api.name}</div>
                    <div className="text-xs uppercase tracking-[0.18em] text-[var(--text-faint)]">{api.purpose}</div>
                  </div>
                  <div
                    className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.22em] ${
                      api.status === "live" ? "bg-[var(--good-bg)] text-[var(--good)]" : api.status === "mixed" ? "bg-[var(--accent-soft-bg)] text-[var(--accent-text)]" : "bg-[var(--warn-bg)] text-[var(--warn)]"
                    }`}
                  >
                    {api.status}
                  </div>
                </div>
                <div className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{api.summary}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
