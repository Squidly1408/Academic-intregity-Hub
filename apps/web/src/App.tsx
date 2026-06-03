import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { loadJob, reportUrl, startAnalysis } from "./lib/api";
import type { AnalysisResult, JobPayload } from "./lib/types";
import { UploadPanel } from "./components/UploadPanel";
import { AnalysisDashboard } from "./components/AnalysisDashboard";
import { BrandMark } from "./components/BrandMark";

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
  "AI detection: Copyleaks, GPTZero, Winston AI, Originality.ai, ZeroGPT",
  "Grammar: LanguageTool plus structural sentence review",
  "Citation source checks: Crossref, OpenAlex, Semantic Scholar",
  "Style integrity: burstiness, repetition, quote attribution, paraphrase drift"
];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
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

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <div className="mx-auto grid min-h-screen w-full max-w-[1520px] gap-6 px-4 py-4 xl:grid-cols-[300px_1fr] xl:px-6">
        <aside className="hidden flex-col justify-between rounded-[2rem] border border-white/10 bg-slate-950/55 p-6 shadow-soft backdrop-blur-xl xl:flex">
          <div className="space-y-6">
            <BrandMark />
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
              <div className="text-xs uppercase tracking-[0.28em] text-cyan-100/70">Free analysis studio</div>
              <p className="mt-3 text-sm leading-6 text-slate-200/75">
                Academic review that feels designed, not assembled. Upload once, inspect everything, and export a report that reads like a product.
              </p>
            </div>
            <div className="space-y-3">
              {detectionBullets.map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100/82">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-[1.5rem] border border-cyan-300/20 bg-cyan-300/10 p-4">
              <div className="text-xs uppercase tracking-[0.28em] text-cyan-100/70">Live system</div>
              <div className="mt-2 text-sm text-cyan-50/90">{job ? `${job.progress}% processed` : "Idle and ready"}</div>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-xs uppercase tracking-[0.24em] text-slate-200/70">
              No login, no subscriptions, no persistent uploads.
            </div>
          </div>
        </aside>

        <main className="space-y-6">
          <header className="glass flex flex-col gap-4 rounded-[2rem] px-5 py-4 shadow-soft lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <BrandMark compact />
              <div className="hidden h-10 w-px bg-white/10 lg:block" />
              <div>
                <div className="text-xs uppercase tracking-[0.32em] text-cyan-100/70">Academic Integrity Hub</div>
                <div className="text-sm text-slate-200/70">Editorial-grade detection, source verification, and exportable reports</div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs uppercase tracking-[0.26em] text-emerald-100">
                Live analysis
              </div>
              <label className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100/90">
                Language
                <select className="ml-3 bg-transparent text-white outline-none" value={language} onChange={(event) => setLanguage(event.target.value)}>
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </label>
              <button className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100 transition hover:bg-cyan-300/20" onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}>
                {theme === "dark" ? "Light" : "Dark"} mode
              </button>
            </div>
          </header>

          <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="overflow-hidden rounded-[2.2rem] border border-white/10 bg-white/[0.04] p-6 shadow-soft backdrop-blur-xl md:p-8">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-[0.72rem] uppercase tracking-[0.3em] text-cyan-100/80">
                  Premium academic analysis without accounts
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[0.72rem] uppercase tracking-[0.24em] text-slate-200/70">
                  {job ? `Job ${job.id.slice(0, 8)} · ${job.progress}%` : "No job running"}
                </span>
              </div>

              <div className="mt-6 max-w-3xl">
                <h1 className="text-4xl font-semibold leading-[1.03] tracking-[-0.04em] text-white md:text-6xl">
                  Built like a serious editorial tool, not a generic AI dashboard.
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200/76 md:text-lg">
                  Academic Integrity Hub combines AI detection, grammar intelligence, citation validation, source matching, quote integrity, and style checks in one free workflow.
                </p>
              </div>

              <div className="mt-7 grid gap-4 sm:grid-cols-3">
                {starterStats.map((stat) => (
                  <div key={stat.label} className="rounded-[1.5rem] border border-white/10 bg-slate-950/35 p-4">
                    <div className="text-[0.67rem] uppercase tracking-[0.28em] text-slate-300/65">{stat.label}</div>
                    <div className="mt-3 text-2xl font-semibold text-white">{stat.value}</div>
                  </div>
                ))}
              </div>

              <div className="mt-7 space-y-4">
                <UploadPanel onSelect={handleStartAnalysis} isProcessing={isProcessing} />

                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-200/75">
                  <button
                    className="rounded-full bg-cyan-300 px-5 py-3 font-medium text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-slate-500"
                    onClick={() => handleStartAnalysis(files)}
                    disabled={!files.length || isProcessing}
                  >
                    Start Analysis
                  </button>
                  {job?.result ? (
                    <a href={reportUrl(job.id, "html")} className="rounded-full border border-cyan-300/25 px-4 py-3 text-cyan-100 transition hover:bg-cyan-300/10" target="_blank" rel="noreferrer">
                      Open report
                    </a>
                  ) : null}
                  <div className="rounded-full border border-white/10 px-4 py-3 text-slate-200/80">
                    {progressLabel}
                  </div>
                </div>

                <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-500 transition-all duration-500" style={{ width: `${job?.progress ?? 0}%` }} />
                </div>

                {error ? <div className="rounded-2xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-100">{error}</div> : null}

                <div className="flex flex-wrap gap-2 text-xs text-slate-300/75">
                  {files.map((file) => (
                    <span key={`${file.name}-${file.lastModified}`} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                      {file.name} · {formatBytes(file.size)}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[2rem] border border-white/10 bg-slate-950/45 p-6 shadow-soft backdrop-blur-xl">
                <div className="text-xs uppercase tracking-[0.3em] text-cyan-100/70">Detection atlas</div>
                <div className="mt-5 space-y-3">
                  {detectionBullets.map((item) => (
                    <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-100/80">
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-slate-950/45 p-6 shadow-soft backdrop-blur-xl">
                <div className="text-xs uppercase tracking-[0.3em] text-cyan-100/70">How it behaves</div>
                <div className="mt-4 space-y-3 text-sm leading-6 text-slate-200/75">
                  {heroSignals.map((signal) => (
                    <div key={signal} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      {signal}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-slate-950/45 p-6 shadow-soft backdrop-blur-xl">
                <div className="text-xs uppercase tracking-[0.3em] text-cyan-100/70">Privacy note</div>
                <div className="mt-3 space-y-2 text-sm leading-6 text-slate-200/75">
                  <p>Files are processed temporarily.</p>
                  <p>Uploads are not stored by default.</p>
                  <p>External APIs enrich the analysis when configured, otherwise the local detectors remain active.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <AnalysisDashboard result={result} />
            <div className="space-y-6">
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-soft backdrop-blur-xl">
                <div className="text-xs uppercase tracking-[0.3em] text-cyan-100/70">Export and trust</div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <a className={`rounded-full px-4 py-2 text-sm ${job?.result ? "bg-cyan-300 text-slate-950" : "pointer-events-none bg-white/10 text-slate-400"}`} href={job?.result ? reportUrl(job.id, "pdf") : "#"}>
                    PDF
                  </a>
                  <a className={`rounded-full px-4 py-2 text-sm ${job?.result ? "bg-white/10 text-white" : "pointer-events-none bg-white/5 text-slate-500"}`} href={job?.result ? reportUrl(job.id, "docx") : "#"}>
                    DOCX
                  </a>
                  <a className={`rounded-full px-4 py-2 text-sm ${job?.result ? "bg-white/10 text-white" : "pointer-events-none bg-white/5 text-slate-500"}`} href={job?.result ? reportUrl(job.id, "html") : "#"} target="_blank" rel="noreferrer">
                    HTML
                  </a>
                </div>
                <div className="mt-4 text-sm text-slate-200/70">Reports include detection modules, source verification, and public catalog/API coverage.</div>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-soft backdrop-blur-xl">
                <div className="text-xs uppercase tracking-[0.3em] text-cyan-100/70">Public APIs in use</div>
                <div className="mt-4 space-y-3">
                  {(result?.apiCoverage ?? [
                    { name: "LanguageTool", purpose: "Grammar analysis", status: "live" as const, summary: "Public grammar API queried for style and usage issues." },
                    { name: "Crossref", purpose: "Citation verification", status: "live" as const, summary: "Public scholarly catalog queried for reference matches." },
                    { name: "OpenAlex", purpose: "Source verification", status: "live" as const, summary: "Public work catalog queried for title matches." },
                    { name: "Semantic Scholar", purpose: "Source verification", status: "live" as const, summary: "Public search API queried for supporting matches." }
                  ]).map((api) => (
                    <div key={api.name} className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-medium text-white">{api.name}</div>
                          <div className="text-xs uppercase tracking-[0.2em] text-slate-300/60">{api.purpose}</div>
                        </div>
                        <div className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.24em] ${api.status === "live" ? "bg-emerald-400/10 text-emerald-100" : "bg-amber-400/10 text-amber-100"}`}>
                          {api.status}
                        </div>
                      </div>
                      <div className="mt-3 text-sm leading-6 text-slate-200/72">{api.summary}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-soft backdrop-blur-xl">
                <div className="text-xs uppercase tracking-[0.3em] text-cyan-100/70">Operational posture</div>
                <div className="mt-3 space-y-2 text-sm leading-6 text-slate-200/75">
                  <p>Real-time progress updates stream over WebSocket while the queue processes uploads in the background.</p>
                  <p>Provider outputs are combined into a weighted score with graceful fallback behavior.</p>
                  <p>The UI is tuned to feel like a product dashboard, not a template paste.</p>
                </div>
              </div>
            </div>
          </section>

          <footer className="pb-6 pt-2 text-center text-sm text-slate-300/55">
            Academic Integrity Hub · free to use · no account required · designed for rapid academic review
          </footer>
        </main>
      </div>
    </div>
  );
}
