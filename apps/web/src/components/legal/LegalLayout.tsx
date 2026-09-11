import type { ReactNode } from "react";
import { ArrowLeftIcon } from "../icons";
import { Kicker } from "../ui";

export function LegalLayout({ eyebrow, title, updated, children }: { eyebrow: string; title: string; updated: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
      <a href="#/" className="inline-flex items-center gap-2 text-sm text-[var(--accent-text)] hover:underline">
        <ArrowLeftIcon className="h-4 w-4" /> Back to Academic Integrity Hub
      </a>

      <div className="mt-8">
        <Kicker>{eyebrow}</Kicker>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-[var(--text-primary)] sm:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-[var(--text-faint)]">Last updated {updated}</p>
      </div>

      <div className="prose-legal mt-8 space-y-8 text-[0.95rem] leading-7 text-[var(--text-secondary)]">{children}</div>
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-serif text-lg font-semibold text-[var(--text-primary)]">{title}</h2>
      <div className="mt-2 space-y-3">{children}</div>
    </section>
  );
}
