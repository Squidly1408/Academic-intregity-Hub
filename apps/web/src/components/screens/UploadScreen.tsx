import { AnimatePresence, motion } from "framer-motion";
import { AlertCircleIcon, BoltIcon, CloseIcon, FileIcon, GlobeIcon, ImageFileIcon, LockIcon, ShieldIcon } from "../icons";
import { Button, Card, Kicker } from "../ui";
import { UploadPanel } from "../UploadPanel";

const detectionBullets = [
  { icon: BoltIcon, text: "AI-likelihood detection from local structural-language signals — runs on your device, nothing is sent anywhere for this check" },
  { icon: ShieldIcon, text: "Grammar review via the public LanguageTool API plus structural sentence checks" },
  { icon: GlobeIcon, text: "Citation and source verification against the public Crossref, OpenAlex, and Semantic Scholar catalogs" },
  { icon: BoltIcon, text: "Style integrity: burstiness, repetition, quote attribution, paraphrase drift" }
];

const IMAGE_EXTENSIONS = new Set(["png", "jpg", "jpeg", "webp"]);

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function fileIconFor(name: string) {
  const extension = name.split(".").pop()?.toLowerCase() ?? "";
  return IMAGE_EXTENSIONS.has(extension) ? ImageFileIcon : FileIcon;
}

interface UploadScreenProps {
  files: File[];
  error: string | null;
  isProcessing: boolean;
  onSelect: (files: File[]) => void;
  onRemoveFile: (file: File) => void;
  onStart: () => void;
}

export function UploadScreen({ files, error, isProcessing, onSelect, onRemoveFile, onStart }: UploadScreenProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25, ease: "easeOut" }} className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      <div className="max-w-2xl">
        <Kicker>Free · no login · no upload limit games</Kicker>
        <h1 className="mt-3 font-serif text-4xl font-semibold leading-[1.1] text-[var(--text-primary)] sm:text-5xl">
          A document review, read the way an editor would read it.
        </h1>
        <p className="mt-4 text-base leading-7 text-[var(--text-secondary)]">
          Upload a paper and get AI-detection likelihood, plagiarism heuristics, citation verification, and writing analysis in one report —
          with the flagged passages marked directly on your text.
        </p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
        <div className="space-y-4">
          <UploadPanel onSelect={onSelect} isProcessing={isProcessing} />

          <AnimatePresence>
            {error ? (
              <motion.div
                role="alert"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="flex items-start gap-3 rounded-lg border border-[var(--bad-border)] bg-[var(--bad-bg)] p-4 text-sm text-[var(--bad)]"
              >
                <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {files.length ? (
            <div className="flex flex-wrap gap-2">
              {files.map((file) => {
                const Icon = fileIconFor(file.name);
                return (
                  <span key={`${file.name}-${file.lastModified}`} className="well inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs text-[var(--text-secondary)]">
                    <Icon className="h-3.5 w-3.5 text-[var(--text-faint)]" />
                    {file.name} · {formatBytes(file.size)}
                    <button
                      onClick={() => onRemoveFile(file)}
                      className="ml-0.5 grid h-4 w-4 place-items-center rounded-full text-[var(--text-faint)] transition hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                      aria-label={`Remove ${file.name}`}
                    >
                      <CloseIcon className="h-2.5 w-2.5" />
                    </button>
                  </span>
                );
              })}
            </div>
          ) : null}

          <Button onClick={onStart} disabled={!files.length || isProcessing} className="w-full sm:w-auto">
            {isProcessing ? "Starting…" : "Start analysis"}
          </Button>
        </div>

        <div className="space-y-4">
          <Card className="p-5">
            <Kicker>What we check</Kicker>
            <div className="mt-3 space-y-3">
              {detectionBullets.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-start gap-3 text-sm leading-6 text-[var(--text-secondary)]">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent-text)]" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2">
              <LockIcon className="h-4 w-4 text-[var(--accent-text)]" />
              <Kicker>Privacy</Kicker>
            </div>
            <div className="mt-3 space-y-2 text-sm leading-6 text-[var(--text-secondary)]">
              <p>There's no server — your file is read and analyzed entirely on your device, and disappears when you close the tab.</p>
              <p>A few checks call public, key-less APIs (grammar and citation lookups) directly from your browser; AI-likelihood scoring never leaves it.</p>
              <p>
                Read the full{" "}
                <a href="#/privacy" className="text-[var(--accent-text)] hover:underline">
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
