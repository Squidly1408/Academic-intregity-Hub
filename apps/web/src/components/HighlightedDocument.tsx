import { useMemo, useState } from "react";
import type { HighlightRange } from "../lib/types";
import { CheckCircleIcon, CopyIcon } from "./icons";
import { Card, Kicker } from "./ui";

type MarkKind = "ai-detection" | "plagiarism";

interface TaggedRange extends HighlightRange {
  kind: MarkKind;
}

interface HighlightedDocumentProps {
  text: string;
  aiFindings: HighlightRange[];
  plagiarismFindings: HighlightRange[];
}

const markMeta: Record<MarkKind, { label: string; legend: string; className: string }> = {
  "ai-detection": {
    label: "AI-style phrasing",
    legend: "Likely AI phrasing",
    className: "border-b-2 border-[var(--mark-ai-border)] bg-[var(--mark-ai-bg)]"
  },
  plagiarism: {
    label: "Possible plagiarism",
    legend: "Possible overlap",
    className: "border-b-2 border-dashed border-[var(--mark-plagiarism-border)] bg-[var(--mark-plagiarism-bg)]"
  }
};

interface Segment {
  text: string;
  finding?: TaggedRange;
}

function buildSegments(text: string, findings: TaggedRange[]): Segment[] {
  const valid = findings
    .filter((finding) => finding.start >= 0 && finding.end > finding.start && finding.end <= text.length)
    .sort((a, b) => a.start - b.start || b.end - a.end);

  const nonOverlapping: TaggedRange[] = [];
  let cursor = 0;
  for (const finding of valid) {
    if (finding.start < cursor) continue;
    nonOverlapping.push(finding);
    cursor = finding.end;
  }

  const segments: Segment[] = [];
  let pos = 0;
  for (const finding of nonOverlapping) {
    if (finding.start > pos) {
      segments.push({ text: text.slice(pos, finding.start) });
    }
    segments.push({ text: text.slice(finding.start, finding.end), finding });
    pos = finding.end;
  }
  if (pos < text.length) {
    segments.push({ text: text.slice(pos) });
  }
  return segments;
}

export function HighlightedDocument({ text, aiFindings, plagiarismFindings }: HighlightedDocumentProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const segments = useMemo(() => {
    const tagged: TaggedRange[] = [
      ...aiFindings.map((finding) => ({ ...finding, kind: "ai-detection" as const })),
      ...plagiarismFindings.map((finding) => ({ ...finding, kind: "plagiarism" as const }))
    ];
    return buildSegments(text, tagged);
  }, [text, aiFindings, plagiarismFindings]);

  const hasHighlights = aiFindings.length + plagiarismFindings.length > 0;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard access denied — silently ignore, the button just won't confirm
    }
  }

  if (!text.trim()) {
    return null;
  }

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Kicker>Highlighted document copy</Kicker>
          <p className="mt-1 text-sm text-[var(--text-muted)]">A copy of the upload with AI-style phrasing and possible plagiarism marked inline.</p>
        </div>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-xs text-[var(--text-secondary)] transition hover:bg-[var(--surface-hover)]"
        >
          <CopyIcon className="h-3.5 w-3.5" />
          {copied ? "Copied" : "Copy plain text"}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-[var(--mark-ai-border)] bg-[var(--mark-ai-bg)] px-3 py-1.5 text-xs text-[var(--text-secondary)]">
          <span className="h-2 w-2 rounded-full" style={{ background: "var(--mark-ai-dot)" }} />
          {markMeta["ai-detection"].legend} · {aiFindings.length}
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-[var(--mark-plagiarism-border)] bg-[var(--mark-plagiarism-bg)] px-3 py-1.5 text-xs text-[var(--text-secondary)]">
          <span className="h-2 w-2 rounded-full" style={{ background: "var(--mark-plagiarism-dot)" }} />
          {markMeta.plagiarism.legend} · {plagiarismFindings.length}
        </span>
      </div>

      {!hasHighlights ? (
        <div className="mt-4 flex items-start gap-3 rounded-lg border border-[var(--good-border)] bg-[var(--good-bg)] p-4 text-sm text-[var(--good)]">
          <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0" />
          No AI-style phrasing or plagiarism markers were found in this document — it reads clean.
        </div>
      ) : null}

      <div className="relative mt-4">
        <div
          className={`well rounded-lg p-5 font-serif text-[0.98rem] leading-8 text-[var(--text-secondary)] transition-[max-height] duration-300 ${expanded ? "max-h-none overflow-visible" : "max-h-[26rem] overflow-hidden"}`}
          style={{ whiteSpace: "pre-wrap" }}
        >
          {segments.map((segment, index) =>
            segment.finding ? (
              <mark key={index} title={`${markMeta[segment.finding.kind].label}${segment.finding.suggestion ? ` — ${segment.finding.suggestion}` : ""}`} className={`rounded-[3px] px-0.5 text-[var(--text-primary)] ${markMeta[segment.finding.kind].className}`}>
                {segment.text}
              </mark>
            ) : (
              <span key={index}>{segment.text}</span>
            )
          )}
        </div>
        {!expanded ? <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 rounded-b-lg bg-gradient-to-t from-[var(--surface-muted)] to-transparent" /> : null}
      </div>

      <button onClick={() => setExpanded((current) => !current)} className="mt-3 text-xs font-medium uppercase tracking-[0.14em] text-[var(--accent-text)] hover:underline">
        {expanded ? "Collapse" : "Show full document"}
      </button>
    </Card>
  );
}
