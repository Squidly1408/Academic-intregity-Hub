import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { io } from "socket.io-client";
import { loadJob, reportUrl, startAnalysis } from "./lib/api";
import type { AnalysisResult, JobPayload } from "./lib/types";
import { UploadPanel } from "./components/UploadPanel";
import { AnalysisDashboard } from "./components/AnalysisDashboard";
import { BrandMark } from "./components/BrandMark";
import { AlertCircleIcon, BoltIcon, CloseIcon, DownloadIcon, ExternalLinkIcon, FileIcon, GlobeIcon, ImageFileIcon, MoonIcon, ShieldIcon, SunIcon } from "./components/icons";

const socket = io(import.meta.env.VITE_API_URL ?? "http://localhost:8787", { autoConnect: false });

const starterStats = [
  { label: "Files processed", value: "12.4k" },
  { label: "Average turnaround", value: "14s" },
  { label: "Detection modules", value: "11" },
  { label: "Public APIs", value: "6" }
];

const heroSignals = [
  "No login, no account, no payment wall",
  "Parallel AI, grammar, citation, and source checks",
  "Live WebSocket progress and export-ready reports"
];

const detectionBullets = [
  { icon: BoltIcon, text: "AI detection: Copyleaks, GPTZero, Winston AI, Originality.ai, ZeroGPT" },
  { icon: ShieldIcon, text: "Grammar: LanguageTool plus structural sentence review" },
  { icon: GlobeIcon, text: "Citation source checks: Crossref, OpenAlex, Semantic Scholar" },
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

export default function App() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [files, setFiles] = useState<File[]>([]);
  const [job, setJob] = useState<JobPayload | null>(null);
  const [result, setResult] = useState<AnalysisResult | undefined>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
  }, [theme]);

  useEffect(() => {
    socket.connect();
    socket.on("job:update", (payload: JobPayload) => {
      setJob(payload);
      if (payload.result) {
        setResult(payload.result);
        setIsProcessing(false);
      }
      if (payload.status === "failed") {
        setError(payload.error ?? "Analysis failed");
        setIsProcessing(false);
      }
    });

    return () => {
      socket.off("job:update");
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!job?.id) return;
    socket.emit("subscribe", job.id);
  }, [job?.id]);

  const progressLabel = useMemo(() => {
    if (!job) return "Awaiting upload";
    return job.message;
  }, [job]);

  async function handleStartAnalysis(selectedFiles: File[]) {
    if (!selectedFiles.length) {
      setError("Choose at least one file before starting analysis.");
      return;
    }

    setError(null);
    setIsProcessing(true);
    setFiles(selectedFiles);
    setResult(undefined);

    try {
      const nextJob = await startAnalysis(selectedFiles, selectedFiles.length > 1 ? "compare" : "single", language);
      setJob(nextJob);
      socket.emit("subscribe", nextJob.id);
      const current = await loadJob(nextJob.id);
      if (current.result) {
        setResult(current.result);
        setIsProcessing(false);
      }
    } catch (submitError) {
      setError((submitError as Error).message);
      setIsProcessing(false);
    }
  }

  function handleRemoveFile(target: File) {
    setFiles((current) => current.filter((file) => file !== target));
  }

  const primaryActionLabel = result ? "Re-run analysis" : "Start analysis";

  return (
    <div className="relative min-h-screen overflow-hidden text-[var(--text-primary)]">
      <div className="mx-auto grid min-h-screen w-full max-w-[1520px] gap-6 px-4 py-4 sm:px-6 xl:grid-cols-[300px_1fr] xl:px-6">
        <aside className="glass-solid hidden flex-col justify-between rounded-[2rem] p-6 xl:flex">
          <div className="space-y-6">
            <BrandMark />
            <div className="chip rounded-[1.5rem] p-4">
              <div className="text-xs uppercase tracking-[0.28em] text-[var(--accent-text)]">Free analysis studio</div>
              <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                Academic review that feels designed, not assembled. Upload once, inspect everything, and export a report that reads like a product.
              </p>
            </div>
            <div className="space-y-3">
              {detectionBullets.map(({ icon: Icon, text }) => (
                <div key={text} className="chip flex items-start gap-3 rounded-2xl px-4 py-3 text-sm text-[var(--text-secondary)]">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent-text)]" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-[1.5rem] border border-[var(--accent-soft-border)] bg-[var(--accent-soft-bg)] p-4">
              <div className="text-xs uppercase tracking-[0.28em] text-[var(--accent-text)]">Live system</div>
              <div className="mt-2 text-sm text-[var(--text-primary)]">{job ? `${job.progress}% processed` : "Idle and ready"}</div>
            </div>
            <div className="chip rounded-[1.5rem] p-4 text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">No login, no subscriptions, no persistent uploads.</div>
          </div>
        </aside>

        <main className="space-y-6">
          <header className="glass flex flex-col gap-4 rounded-[2rem] px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <BrandMark compact />
              <div className="hidden h-10 w-px bg-[var(--border)] lg:block" />
              <div>
                <div className="text-xs uppercase tracking-[0.32em] text-[var(--accent-text)]">Academic Integrity Hub</div>
                <div className="text-sm text-[var(--text-muted)]">Editorial-grade detection, source verification, and exportable reports</div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[var(--good-border)] bg-[var(--good-bg)] px-4 py-2 text-xs uppercase tracking-[0.26em] text-[var(--good)]">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--good)] opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--good)]" />
                </span>
                Live analysis
              </div>
              <label className="chip flex items-center rounded-full px-4 py-2 text-sm text-[var(--text-secondary)]">
                <span className="sr-only">Report language</span>
                Language
                <select
                  className="ml-3 bg-transparent text-[var(--text-primary)] outline-none"
                  value={language}
                  onChange={(event) => setLanguage(event.target.value)}
                  aria-label="Report language"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </label>
              <button
                className="inline-flex items-center gap-2 rounded-full border border-[var(--accent-soft-border)] bg-[var(--accent-soft-bg)] px-4 py-2 text-sm text-[var(--accent-text)] transition hover:bg-[var(--surface-4)]"
                onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
                aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              >
                {theme === "dark" ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
                {theme === "dark" ? "Light" : "Dark"} mode
              </button>
            </div>
          </header>

          <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: "easeOut" }} className="glass overflow-hidden rounded-[2.2rem] p-6 md:p-8">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-[var(--accent-soft-border)] bg-[var(--accent-soft-bg)] px-4 py-2 text-[0.72rem] uppercase tracking-[0.3em] text-[var(--accent-text)]">
                  Premium academic analysis without accounts
                </span>
                <span className="chip rounded-full px-4 py-2 text-[0.72rem] uppercase tracking-[0.24em] text-[var(--text-muted)]">
                  {job ? `Job ${job.id.slice(0, 8)} · ${job.progress}%` : "No job running"}
                </span>
              </div>

              <div className="mt-6 max-w-3xl">
                <h1 className="text-4xl font-semibold leading-[1.03] tracking-[-0.04em] text-[var(--text-primary)] md:text-6xl">
                  Built like a serious editorial tool, not a generic AI dashboard.
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--text-secondary)] md:text-lg">
                  Academic Integrity Hub combines AI detection, grammar intelligence, citation validation, source matching, quote integrity, and style checks in one free workflow.
                </p>
              </div>

              <div className="mt-7 grid gap-4 sm:grid-cols-3">
                {starterStats.map((stat) => (
                  <div key={stat.label} className="glass-solid rounded-[1.5rem] p-4">
                    <div className="text-[0.67rem] uppercase tracking-[0.28em] text-[var(--text-muted)]">{stat.label}</div>
                    <div className="mt-3 text-2xl font-semibold text-[var(--text-primary)]">{stat.value}</div>
                  </div>
                ))}
              </div>

              <div className="mt-7 space-y-4">
                <UploadPanel onSelect={handleStartAnalysis} isProcessing={isProcessing} />

                <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--text-secondary)]">
                  <button
                    className="rounded-full bg-[var(--accent)] px-5 py-3 font-medium text-[var(--accent-ink)] transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-45"
                    onClick={() => handleStartAnalysis(files)}
                    disabled={!files.length || isProcessing}
                  >
                    {isProcessing ? "Analyzing…" : primaryActionLabel}
                  </button>
                  {job?.result ? (
                    <a
                      href={reportUrl(job.id, "html")}
                      className="inline-flex items-center gap-2 rounded-full border border-[var(--accent-soft-border)] px-4 py-3 text-[var(--accent-text)] transition hover:bg-[var(--accent-soft-bg)]"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open report <ExternalLinkIcon className="h-4 w-4" />
                    </a>
                  ) : null}
                  <div className="chip rounded-full px-4 py-3 text-[var(--text-secondary)]">{progressLabel}</div>
                </div>

                <div className="h-3 w-full overflow-hidden rounded-full bg-[var(--surface-4)]">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-500"
                    animate={{ width: `${job?.progress ?? 0}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>

                <AnimatePresence>
                  {error ? (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="flex items-start gap-3 rounded-2xl border border-[var(--bad-border)] bg-[var(--bad-bg)] p-4 text-sm text-[var(--bad)]"
                    >
                      <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{error}</span>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                {files.length ? (
                  <div className="flex flex-wrap gap-2 text-xs text-[var(--text-secondary)]">
                    {files.map((file) => {
                      const Icon = fileIconFor(file.name);
                      return (
                        <span key={`${file.name}-${file.lastModified}`} className="chip inline-flex items-center gap-2 rounded-full px-3 py-1.5">
                          <Icon className="h-3.5 w-3.5 text-[var(--text-faint)]" />
                          {file.name} · {formatBytes(file.size)}
                          {!isProcessing ? (
                            <button
                              onClick={() => handleRemoveFile(file)}
                              className="ml-0.5 grid h-4 w-4 place-items-center rounded-full text-[var(--text-faint)] transition hover:bg-[var(--surface-4)] hover:text-[var(--text-primary)]"
                              aria-label={`Remove ${file.name}`}
                            >
                              <CloseIcon className="h-2.5 w-2.5" />
                            </button>
                          ) : null}
                        </span>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            </motion.div>

            <div className="space-y-6">
              <div className="glass-solid rounded-[2rem] p-6">
                <div className="text-xs uppercase tracking-[0.3em] text-[var(--accent-text)]">Detection atlas</div>
                <div className="mt-5 space-y-3">
                  {detectionBullets.map(({ icon: Icon, text }) => (
                    <div key={text} className="chip flex items-start gap-3 rounded-2xl p-4 text-sm leading-6 text-[var(--text-secondary)]">
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent-text)]" />
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-solid rounded-[2rem] p-6">
                <div className="text-xs uppercase tracking-[0.3em] text-[var(--accent-text)]">How it behaves</div>
                <div className="mt-4 space-y-3 text-sm leading-6 text-[var(--text-secondary)]">
                  {heroSignals.map((signal) => (
                    <div key={signal} className="chip rounded-2xl p-4">
                      {signal}
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-solid rounded-[2rem] p-6">
                <div className="text-xs uppercase tracking-[0.3em] text-[var(--accent-text)]">Privacy note</div>
                <div className="mt-3 space-y-2 text-sm leading-6 text-[var(--text-secondary)]">
                  <p>Files are processed temporarily.</p>
                  <p>Uploads are not stored by default.</p>
                  <p>External APIs enrich the analysis when configured, otherwise the local detectors remain active.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <AnalysisDashboard result={result} isProcessing={isProcessing} />
            <div className="space-y-6">
              <div className="glass rounded-[2rem] p-6">
                <div className="text-xs uppercase tracking-[0.3em] text-[var(--accent-text)]">Export and trust</div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <a
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition ${job?.result ? "bg-[var(--accent)] text-[var(--accent-ink)] hover:bg-[var(--accent-strong)]" : "pointer-events-none bg-[var(--surface-4)] text-[var(--text-faint)]"}`}
                    href={job?.result ? reportUrl(job.id, "pdf") : "#"}
                  >
                    <DownloadIcon className="h-3.5 w-3.5" /> PDF
                  </a>
                  <a
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition ${job?.result ? "bg-[var(--surface-4)] text-[var(--text-primary)] hover:bg-[var(--surface-3)]" : "pointer-events-none bg-[var(--surface-3)] text-[var(--text-faint)]"}`}
                    href={job?.result ? reportUrl(job.id, "docx") : "#"}
                  >
                    <DownloadIcon className="h-3.5 w-3.5" /> DOCX
                  </a>
                  <a
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition ${job?.result ? "bg-[var(--surface-4)] text-[var(--text-primary)] hover:bg-[var(--surface-3)]" : "pointer-events-none bg-[var(--surface-3)] text-[var(--text-faint)]"}`}
                    href={job?.result ? reportUrl(job.id, "html") : "#"}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLinkIcon className="h-3.5 w-3.5" /> HTML
                  </a>
                </div>
                <div className="mt-4 text-sm text-[var(--text-muted)]">Reports include detection modules, source verification, and public catalog/API coverage.</div>
              </div>

              <div className="glass rounded-[2rem] p-6">
                <div className="text-xs uppercase tracking-[0.3em] text-[var(--accent-text)]">Public APIs in use</div>
                <div className="mt-4 space-y-3">
                  {(result?.apiCoverage ?? [
                    { name: "LanguageTool", purpose: "Grammar analysis", status: "live" as const, summary: "Public grammar API queried for style and usage issues." },
                    { name: "Crossref", purpose: "Citation verification", status: "live" as const, summary: "Public scholarly catalog queried for reference matches." },
                    { name: "OpenAlex", purpose: "Source verification", status: "live" as const, summary: "Public work catalog queried for title matches." },
                    { name: "Semantic Scholar", purpose: "Source verification", status: "live" as const, summary: "Public search API queried for supporting matches." }
                  ]).map((api) => (
                    <div key={api.name} className="glass-solid rounded-2xl p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-medium text-[var(--text-primary)]">{api.name}</div>
                          <div className="text-xs uppercase tracking-[0.2em] text-[var(--text-faint)]">{api.purpose}</div>
                        </div>
                        <div className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.24em] ${api.status === "live" ? "bg-[var(--good-bg)] text-[var(--good)]" : "bg-[var(--warn-bg)] text-[var(--warn)]"}`}>
                          {api.status}
                        </div>
                      </div>
                      <div className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{api.summary}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass rounded-[2rem] p-6">
                <div className="text-xs uppercase tracking-[0.3em] text-[var(--accent-text)]">Operational posture</div>
                <div className="mt-3 space-y-2 text-sm leading-6 text-[var(--text-secondary)]">
                  <p>Real-time progress updates stream over WebSocket while the queue processes uploads in the background.</p>
                  <p>Provider outputs are combined into a weighted score with graceful fallback behavior.</p>
                  <p>The UI is tuned to feel like a product dashboard, not a template paste.</p>
                </div>
              </div>
            </div>
          </section>

          <footer className="pb-6 pt-2 text-center text-sm text-[var(--text-faint)]">
            Academic Integrity Hub · free to use · no account required · designed for rapid academic review
          </footer>
        </main>
      </div>
    </div>
  );
}
