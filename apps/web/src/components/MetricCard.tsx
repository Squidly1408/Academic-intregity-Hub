import { AlertCircleIcon, AlertTriangleIcon, CheckCircleIcon, InfoCircleIcon } from "./icons";
import { Card } from "./ui";

interface MetricCardProps {
  label: string;
  value: string;
  tone?: "good" | "warn" | "bad" | "info";
}

const toneMeta = {
  good: { text: "text-[var(--good)]", bg: "bg-[var(--good-bg)]", word: "Healthy", Icon: CheckCircleIcon },
  warn: { text: "text-[var(--warn)]", bg: "bg-[var(--warn-bg)]", word: "Watch", Icon: AlertTriangleIcon },
  bad: { text: "text-[var(--bad)]", bg: "bg-[var(--bad-bg)]", word: "At risk", Icon: AlertCircleIcon },
  info: { text: "text-[var(--accent-text)]", bg: "bg-[var(--accent-soft-bg)]", word: "Summary", Icon: InfoCircleIcon }
};

export function MetricCard({ label, value, tone = "info" }: MetricCardProps) {
  const meta = toneMeta[tone];
  const { Icon } = meta;

  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">{label}</div>
        <div className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${meta.bg} ${meta.text}`}>
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>
      <div className="font-serif text-2xl font-semibold text-[var(--text-primary)]">{value}</div>
      <div className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[0.65rem] font-medium uppercase tracking-[0.12em] ${meta.bg} ${meta.text}`}>{meta.word}</div>
    </Card>
  );
}
