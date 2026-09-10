import { AlertCircleIcon, AlertTriangleIcon, CheckCircleIcon, InfoCircleIcon } from "./icons";

interface MetricCardProps {
  label: string;
  value: string;
  delta?: string;
  tone?: "good" | "warn" | "bad" | "info";
}

const toneMeta = {
  good: {
    text: "text-[var(--good)]",
    bg: "bg-[var(--good-bg)]",
    border: "border-[var(--good-border)]",
    word: "Healthy",
    Icon: CheckCircleIcon
  },
  warn: {
    text: "text-[var(--warn)]",
    bg: "bg-[var(--warn-bg)]",
    border: "border-[var(--warn-border)]",
    word: "Watch",
    Icon: AlertTriangleIcon
  },
  bad: {
    text: "text-[var(--bad)]",
    bg: "bg-[var(--bad-bg)]",
    border: "border-[var(--bad-border)]",
    word: "At risk",
    Icon: AlertCircleIcon
  },
  info: {
    text: "text-[var(--accent-text)]",
    bg: "bg-[var(--accent-soft-bg)]",
    border: "border-[var(--accent-soft-border)]",
    word: "Summary",
    Icon: InfoCircleIcon
  }
};

export function MetricCard({ label, value, delta, tone = "info" }: MetricCardProps) {
  const meta = toneMeta[tone];
  const { Icon } = meta;

  return (
    <div className={`glass flex flex-col gap-4 rounded-3xl p-5 transition duration-300 hover:border-[var(--border-strong)] ${meta.border}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">{label}</div>
        <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${meta.bg} ${meta.text}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div>
        <div className="text-3xl font-semibold text-[var(--text-primary)]">{value}</div>
        {delta ? <div className="mt-1 text-sm text-[var(--text-muted)]">{delta}</div> : null}
      </div>
      <div className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.68rem] font-medium uppercase tracking-[0.16em] ${meta.bg} ${meta.text}`}>
        {meta.word}
      </div>
    </div>
  );
}
