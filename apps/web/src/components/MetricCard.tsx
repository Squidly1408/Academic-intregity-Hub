interface MetricCardProps {
  label: string;
  value: string;
  delta?: string;
  tone?: "good" | "warn" | "bad" | "info";
}

const toneClasses = {
  good: "from-emerald-400/20 to-emerald-500/5 text-emerald-200",
  warn: "from-amber-400/20 to-amber-500/5 text-amber-200",
  bad: "from-rose-400/20 to-rose-500/5 text-rose-200",
  info: "from-cyan-400/20 to-cyan-500/5 text-cyan-200"
};

export function MetricCard({ label, value, delta, tone = "info" }: MetricCardProps) {
  return (
    <div className={`glass rounded-3xl p-5 shadow-soft bg-gradient-to-br ${toneClasses[tone]}`}>
      <div className="text-xs uppercase tracking-[0.24em] text-slate-300/80">{label}</div>
      <div className="mt-3 text-3xl font-semibold text-white">{value}</div>
      {delta ? <div className="mt-2 text-sm text-slate-200/80">{delta}</div> : null}
    </div>
  );
}
