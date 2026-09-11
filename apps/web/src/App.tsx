import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { runAnalysisPipeline } from "./lib/api";
import type { AnalysisProgress, AnalysisResult } from "./lib/types";
import { AppFooter } from "./components/AppFooter";
import { TopBar, type Step } from "./components/TopBar";
import { UploadScreen } from "./components/screens/UploadScreen";
import { ProcessingScreen } from "./components/screens/ProcessingScreen";
import { ReportScreen } from "./components/screens/ReportScreen";
import { PrivacyPolicy } from "./components/legal/PrivacyPolicy";
import { TermsAndConditions } from "./components/legal/TermsAndConditions";

type Page = "app" | "privacy" | "terms";

function readPage(): Page {
  const hash = window.location.hash.replace(/^#\/?/, "");
  if (hash === "privacy") return "privacy";
  if (hash === "terms") return "terms";
  return "app";
}

function readStoredTheme(): "dark" | "light" {
  try {
    const stored = window.localStorage.getItem("aih-theme");
    if (stored === "dark" || stored === "light") return stored;
  } catch {
    // storage unavailable — fall through to system preference
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function App() {
  const [page, setPage] = useState<Page>(readPage);
  const [theme, setTheme] = useState<"dark" | "light">(readStoredTheme);
  const [step, setStep] = useState<Step>("upload");
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<AnalysisProgress | null>(null);
  const [result, setResult] = useState<AnalysisResult | undefined>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    const onHashChange = () => setPage(readPage());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    try {
      window.localStorage.setItem("aih-theme", theme);
    } catch {
      // storage unavailable — theme still applies for this session
    }
  }, [theme]);

  async function handleStartAnalysis(selectedFiles: File[]) {
    if (!selectedFiles.length) {
      setError("Choose at least one file before starting analysis.");
      return;
    }

    setError(null);
    setIsProcessing(true);
    setFiles(selectedFiles);
    setResult(undefined);
    setProgress({ stage: "extracting", progress: 0, message: "Starting…" });
    setStep("processing");

    try {
      const analysisResult = await runAnalysisPipeline(selectedFiles, language, setProgress);
      setResult(analysisResult);
      setIsProcessing(false);
      setStep("report");
    } catch (submitError) {
      setError((submitError as Error).message || "Analysis failed — try a different file.");
      setIsProcessing(false);
    }
  }

  function handleSelectFiles(selectedFiles: File[]) {
    setFiles(selectedFiles);
    setError(null);
  }

  function handleRemoveFile(target: File) {
    setFiles((current) => current.filter((file) => file !== target));
  }

  function handleStartOver() {
    setFiles([]);
    setProgress(null);
    setResult(undefined);
    setError(null);
    setIsProcessing(false);
    setStep("upload");
  }

  function handleBackToUpload() {
    setError(null);
    setIsProcessing(false);
    setStep("upload");
  }

  if (page === "privacy") return <PrivacyPolicy />;
  if (page === "terms") return <TermsAndConditions />;

  return (
    <div className="flex min-h-screen flex-col text-[var(--text-primary)]">
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <TopBar
        step={step}
        theme={theme}
        onToggleTheme={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
        language={language}
        onLanguageChange={setLanguage}
        showLanguage={step === "upload"}
      />

      <main id="main" className="flex-1">
        <AnimatePresence mode="wait">
          {step === "upload" ? (
            <UploadScreen key="upload" files={files} error={error} isProcessing={isProcessing} onSelect={handleSelectFiles} onRemoveFile={handleRemoveFile} onStart={() => handleStartAnalysis(files)} />
          ) : step === "processing" ? (
            <ProcessingScreen key="processing" progress={progress} files={files} error={error} onRetry={() => handleStartAnalysis(files)} onBack={handleBackToUpload} />
          ) : result ? (
            <ReportScreen key="report" result={result} fileNames={files.map((file) => file.name)} onStartOver={handleStartOver} />
          ) : null}
        </AnimatePresence>
      </main>

      <AppFooter />
    </div>
  );
}
