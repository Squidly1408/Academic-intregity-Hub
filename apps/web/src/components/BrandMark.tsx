interface BrandMarkProps {
  compact?: boolean;
  size?: "sm" | "md";
  className?: string;
}

/**
 * The mark: a page with two rules of text and one rule underlined in red —
 * a document with a line flagged, which is the whole product in one glyph.
 */
export function LogoGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <rect width="48" height="48" rx="10" fill="var(--accent)" />
      <rect x="14" y="12" width="20" height="24" rx="1.5" fill="var(--accent-ink)" />
      <rect x="18" y="18" width="12" height="2" rx="1" fill="var(--accent)" opacity="0.85" />
      <rect x="18" y="23" width="12" height="2" rx="1" fill="var(--accent)" opacity="0.85" />
      <rect x="18" y="28" width="7" height="2" rx="1" fill="#9c2b1c" />
    </svg>
  );
}

export function BrandMark({ compact = false, size = "md", className = "" }: BrandMarkProps) {
  const dim = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <LogoGlyph className={`shrink-0 ${dim}`} />
      {!compact ? (
        <div className="leading-tight">
          <div className="font-serif text-base font-semibold text-[var(--text-primary)]">Academic Integrity Hub</div>
          <div className="text-[0.68rem] uppercase tracking-[0.18em] text-[var(--text-faint)]">Editorial-grade document review</div>
        </div>
      ) : null}
    </div>
  );
}
