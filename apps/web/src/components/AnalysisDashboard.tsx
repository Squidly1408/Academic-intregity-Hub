import { motion } from "framer-motion";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell, Legend } from "recharts";
import type { AnalysisResult } from "../lib/types";
import { MetricCard } from "./MetricCard";

const colors = ["#22d3ee", "#38bdf8", "#60a5fa", "#818cf8", "#a78bfa", "#34d399", "#f59e0b", "#fb7185"];

interface AnalysisDashboardProps {
  result?: AnalysisResult;
}

export function AnalysisDashboard({ result }: AnalysisDashboardProps) {
  if (!result) {
    return (
      <div className="glass rounded-[2rem] p-6 text-slate-200/80">
        Results will appear here once the analysis finishes.
      </div>
    );
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

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {cards.map((card) => (
          <MetricCard key={card.label} label={card.label} value={card.value} tone={card.tone} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <div className="glass rounded-[2rem] p-5 shadow-soft">
          <div className="mb-4 text-sm uppercase tracking-[0.24em] text-slate-300/70">Signal map</div>
          <div className="h-80 w-full">
            <ResponsiveContainer>
              <AreaChart data={result.charts.labels.map((label, index) => ({ label, value: result.charts.scores[index] }))}>
                <defs>
                  <linearGradient id="analysisGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" />
                <XAxis dataKey="label" tick={{ fill: "#cbd5e1", fontSize: 12 }} />
                <YAxis tick={{ fill: "#cbd5e1", fontSize: 12 }} />
                <Tooltip contentStyle={{ background: "#07111f", border: "1px solid rgba(148,163,184,0.2)" }} />
                <Area type="monotone" dataKey="value" stroke="#22d3ee" fill="url(#analysisGradient)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-[2rem] p-5 shadow-soft">
          <div className="mb-4 text-sm uppercase tracking-[0.24em] text-slate-300/70">Risk distribution</div>
          <div className="h-80 w-full">
            <ResponsiveContainer>
              <PieChart>
                <Pie dataKey="value" data={result.charts.labels.map((label, index) => ({ name: label, value: result.charts.scores[index] }))} innerRadius={65} outerRadius={105} paddingAngle={2}>
                  {result.charts.labels.map((_, index) => (
                    <Cell key={index} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#07111f", border: "1px solid rgba(148,163,184,0.2)" }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="glass rounded-[2rem] p-5 shadow-soft">
          <div className="mb-4 text-sm uppercase tracking-[0.24em] text-slate-300/70">Top recommendations</div>
          <div className="space-y-3 text-sm leading-6 text-slate-200/85">
            {result.suggestions.map((suggestion) => (
              <div key={suggestion} className="rounded-2xl border border-white/8 bg-white/5 p-4">{suggestion}</div>
            ))}
          </div>
        </div>

        <div className="glass rounded-[2rem] p-5 shadow-soft">
          <div className="mb-4 text-sm uppercase tracking-[0.24em] text-slate-300/70">Provider comparison</div>
          <div className="space-y-3">
            {result.ai.providers.map((provider) => (
              <div key={provider.provider} className="rounded-2xl border border-white/8 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-medium text-white">{provider.provider}</div>
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-300/65">{provider.status}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-cyan-200">{provider.score}%</div>
                    <div className="text-xs text-slate-300/60">Confidence {provider.confidence}%</div>
                  </div>
                </div>
                <div className="mt-3 text-sm text-slate-200/75">{provider.evidence}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="glass rounded-[2rem] p-5 shadow-soft">
          <div className="mb-4 text-sm uppercase tracking-[0.24em] text-slate-300/70">Detection modules</div>
          <div className="grid gap-3 md:grid-cols-2">
            {result.modules.map((module) => (
              <div key={module.key} className="rounded-2xl border border-white/8 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-medium text-white">{module.label}</div>
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-300/60">{module.category}</div>
                  </div>
                  <div className="text-lg font-semibold text-cyan-200">{module.score}%</div>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-500" style={{ width: `${module.score}%` }} />
                </div>
                <div className="mt-3 text-sm leading-6 text-slate-200/75">{module.summary}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-[2rem] p-5 shadow-soft">
          <div className="mb-4 text-sm uppercase tracking-[0.24em] text-slate-300/70">Public API coverage</div>
          <div className="space-y-3">
            {result.apiCoverage.map((api) => (
              <div key={api.name} className="rounded-2xl border border-white/8 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-medium text-white">{api.name}</div>
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-300/60">{api.purpose}</div>
                  </div>
                  <div className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.22em] ${api.status === "live" ? "bg-emerald-400/10 text-emerald-100" : api.status === "mixed" ? "bg-cyan-400/10 text-cyan-100" : "bg-amber-400/10 text-amber-100"}`}>
                    {api.status}
                  </div>
                </div>
                <div className="mt-3 text-sm leading-6 text-slate-200/75">{api.summary}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
