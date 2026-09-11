import { motion } from "framer-motion";
import type { AnalysisProgress } from "../../lib/types";
import { AlertCircleIcon, FileIcon } from "../icons";
import { Button, Card, Kicker, ProgressBar } from "../ui";

interface ProcessingScreenProps {
  progress: AnalysisProgress | null;
  files: File[];
  error: string | null;
  onRetry: () => void;
  onBack: () => void;
}

const STAGE_HINTS = [
  "Reading your document, entirely in your browser",
  "Running local AI-likelihood and plagiarism heuristics",
  "Cross-checking citations against public catalogs",
  "Scoring writing quality and style consistency",
  "Assembling your report"
];

export function ProcessingScreen({ progress: progressState, files, error, onRetry, onBack }: ProcessingScreenProps) {
  const progress = progressState?.progress ?? 0;
  const hintIndex = Math.min(STAGE_HINTS.length - 1, Math.floor((progress / 100) * STAGE_HINTS.length));

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25, ease: "easeOut" }} className="mx-auto flex min-h-[70vh] max-w-2xl flex-col justify-center px-5 py-14 sm:px-8">
      {error ? (
        <Card className="p-8 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[var(--bad-bg)] text-[var(--bad)]">
            <AlertCircleIcon className="h-6 w-6" />
          </div>
          <h1 className="mt-4 font-serif text-2xl font-semibold text-[var(--text-primary)]">Analysis didn't finish</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{error}</p>
          <div className="mt-6 flex justify-center gap-3">
            <Button variant="secondary" onClick={onBack}>
              Back to upload
            </Button>
            <Button onClick={onRetry}>Try again</Button>
          </div>
        </Card>
      ) : (
        <Card className="p-8 text-center">
          <Kicker>Analyzing</Kicker>
          <h1 className="mt-2 font-serif text-2xl font-semibold text-[var(--text-primary)]">{STAGE_HINTS[hintIndex]}…</h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]" aria-live="polite">
            {progressState?.message ?? "Preparing…"}
          </p>

          <div className="mt-6">
            <ProgressBar value={progress} />
            <div className="mt-2 text-xs uppercase tracking-[0.14em] text-[var(--text-faint)]">{Math.round(progress)}% complete</div>
          </div>

          {files.length ? (
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {files.map((file) => (
                <span key={`${file.name}-${file.lastModified}`} className="well inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs text-[var(--text-secondary)]">
                  <FileIcon className="h-3.5 w-3.5 text-[var(--text-faint)]" />
                  {file.name}
                </span>
              ))}
            </div>
          ) : null}

          <p className="mt-6 text-xs text-[var(--text-faint)]">This usually takes a few seconds — stay on this page, it will move on automatically.</p>
        </Card>
      )}
    </motion.div>
  );
}
