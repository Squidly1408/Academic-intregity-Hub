import { BrandMark } from "./BrandMark";
import { CheckCircleIcon, MoonIcon, SunIcon } from "./icons";

export type Step = "upload" | "processing" | "report";

const STEPS: Array<{ key: Step; label: string }> = [
  { key: "upload", label: "Upload" },
  { key: "processing", label: "Analyze" },
  { key: "report", label: "Report" }
];

interface TopBarProps {
  step: Step;
  theme: "dark" | "light";
  onToggleTheme: () => void;
  language: string;
  onLanguageChange: (language: string) => void;
  showLanguage: boolean;
}

export function TopBar({ step, theme, onToggleTheme, language, onLanguageChange, showLanguage }: TopBarProps) {
  const activeIndex = STEPS.findIndex((item) => item.key === step);

  return (
    <header className="border-b border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <a href="#/" className="shrink-0" aria-label="Academic Integrity Hub home">
          <BrandMark size="sm" />
        </a>

        <nav aria-label="Analysis progress" className="order-3 flex min-w-0 items-center gap-1.5 sm:order-2 sm:gap-2">
          {STEPS.map((item, index) => {
            const isDone = index < activeIndex;
            const isActive = index === activeIndex;
            return (
              <div key={item.key} className="flex min-w-0 items-center gap-1.5 sm:gap-2">
                <div className={`flex items-center gap-1.5 whitespace-nowrap text-xs uppercase tracking-[0.12em] ${isActive ? "font-semibold text-[var(--text-primary)]" : isDone ? "text-[var(--accent-text)]" : "text-[var(--text-faint)]"}`}>
                  {isDone ? (
                    <CheckCircleIcon className="h-3.5 w-3.5 shrink-0" />
                  ) : (
                    <span className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border text-[0.6rem] ${isActive ? "border-[var(--accent)] text-[var(--accent-text)]" : "border-[var(--border-strong)] text-[var(--text-faint)]"}`}>
                      {index + 1}
                    </span>
                  )}
                  <span className="hidden sm:inline">{item.label}</span>
                </div>
                {index < STEPS.length - 1 ? <span className="h-px w-3 shrink-0 bg-[var(--border-strong)] sm:w-10" /> : null}
              </div>
            );
          })}
        </nav>

        <div className="order-2 flex items-center gap-2 sm:order-3">
          {showLanguage ? (
            <label className="hidden items-center rounded-md border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--text-secondary)] sm:inline-flex">
              <span className="sr-only">Report language</span>
              <select
                className="bg-transparent text-[var(--text-primary)] outline-none"
                value={language}
                onChange={(event) => onLanguageChange(event.target.value)}
                aria-label="Report language"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </label>
          ) : null}
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border)] text-[var(--text-secondary)] transition hover:bg-[var(--surface-hover)]"
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
