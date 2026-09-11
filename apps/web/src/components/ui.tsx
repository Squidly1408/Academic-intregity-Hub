import type { ButtonHTMLAttributes, ReactNode } from "react";

/**
 * Shared UI primitives. The whole app is built from this small set so
 * spacing, radii, and states stay consistent instead of ad-hoc per screen.
 */

export function Card({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={`card ${className}`}>{children}</div>;
}

export function Kicker({ children }: { children: ReactNode }) {
  return <div className="kicker">{children}</div>;
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "md" | "sm";
}

const buttonBase = "inline-flex items-center justify-center gap-2 rounded-md font-medium transition disabled:cursor-not-allowed disabled:opacity-45";

const buttonVariants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-[var(--accent)] text-[var(--accent-ink)] hover:bg-[var(--accent-strong)]",
  secondary: "border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)]",
  ghost: "text-[var(--accent-text)] hover:bg-[var(--accent-soft-bg)]"
};

const buttonSizes: Record<NonNullable<ButtonProps["size"]>, string> = {
  md: "px-5 py-2.5 text-sm",
  sm: "px-3.5 py-1.5 text-xs"
};

export function Button({ variant = "primary", size = "md", className = "", ...props }: ButtonProps) {
  return <button className={`${buttonBase} ${buttonVariants[variant]} ${buttonSizes[size]} ${className}`} {...props} />;
}

export function LinkButton({ variant = "secondary", size = "md", className = "", href, ...props }: ButtonProps & { href: string; target?: string; rel?: string }) {
  const disabled = props.disabled;
  return (
    <a
      href={disabled ? undefined : href}
      target={props.target}
      rel={props.rel}
      aria-disabled={disabled}
      className={`${buttonBase} ${buttonVariants[variant]} ${buttonSizes[size]} ${className} ${disabled ? "pointer-events-none opacity-40" : ""}`}
    >
      {props.children as ReactNode}
    </a>
  );
}

type Tone = "good" | "warn" | "bad" | "info" | "neutral";

const toneClasses: Record<Tone, string> = {
  good: "bg-[var(--good-bg)] text-[var(--good)]",
  warn: "bg-[var(--warn-bg)] text-[var(--warn)]",
  bad: "bg-[var(--bad-bg)] text-[var(--bad)]",
  info: "bg-[var(--accent-soft-bg)] text-[var(--accent-text)]",
  neutral: "bg-[var(--surface-muted)] text-[var(--text-muted)]"
};

export function Pill({ tone = "neutral", children, className = "" }: { tone?: Tone; children: ReactNode; className?: string }) {
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.68rem] font-medium uppercase tracking-[0.14em] ${toneClasses[tone]} ${className}`}>{children}</span>;
}

export function ProgressBar({ value, className = "" }: { value: number; className?: string }) {
  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-muted)] ${className}`} role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-500 ease-out" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

export function SectionHeading({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return (
    <div>
      {eyebrow ? <Kicker>{eyebrow}</Kicker> : null}
      <h2 className="mt-1.5 font-serif text-xl font-semibold text-[var(--text-primary)]">{title}</h2>
      {description ? <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">{description}</p> : null}
    </div>
  );
}

export function toneForScore(score: number, invert = false): Tone {
  const good = invert ? score < 35 : score >= 75;
  const warn = invert ? score < 65 : score >= 45;
  if (good) return "good";
  if (warn) return "warn";
  return "bad";
}
