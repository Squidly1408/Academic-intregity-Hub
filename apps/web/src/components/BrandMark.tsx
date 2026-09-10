interface BrandMarkProps {
  compact?: boolean;
  className?: string;
}

export function BrandMark({ compact = false, className = "" }: BrandMarkProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative grid h-12 w-12 shrink-0 place-items-center rounded-[1.15rem] bg-gradient-to-br from-cyan-300 via-sky-500 to-indigo-500 shadow-[0_18px_45px_rgba(14,165,233,0.32)] ring-1 ring-white/25">
        <div className="h-5 w-5 rounded-[0.55rem] border border-white/85 bg-slate-950/80" />
        <div className="absolute inset-x-2 bottom-2 h-1 rounded-full bg-white/70" />
      </div>

      {!compact ? (
        <div className="leading-tight">
          <div className="text-[0.7rem] uppercase tracking-[0.34em] text-[var(--accent-text)]">Academic Integrity Hub</div>
          <div className="text-lg font-semibold text-[var(--text-primary)]">Editorial-grade review</div>
        </div>
      ) : null}
    </div>
  );
}
