import { motion } from "framer-motion";
import type { AnalysisResult } from "../../lib/types";
import { RotateIcon } from "../icons";
import { ApiCoverage } from "../report/ApiCoverage";
import { RiskDistributionChart, SignalChart } from "../report/Charts";
import { ExportBar } from "../report/ExportBar";
import { ModuleGrid } from "../report/ModuleGrid";
import { SignalBreakdown } from "../report/SignalBreakdown";
import { ScoreOverview } from "../report/ScoreOverview";
import { Suggestions } from "../report/Suggestions";
import { HighlightedDocument } from "../HighlightedDocument";
import { Button, Kicker } from "../ui";

interface ReportScreenProps {
  result: AnalysisResult;
  fileNames: string[];
  onStartOver: () => void;
}

export function ReportScreen({ result, fileNames, onStartOver }: ReportScreenProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25, ease: "easeOut" }} className="mx-auto max-w-6xl space-y-6 px-5 py-10 sm:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Kicker>Report</Kicker>
          <h1 className="mt-2 font-serif text-3xl font-semibold text-[var(--text-primary)]">
            Overall score {result.overallScore}% · {result.integrityRating}
          </h1>
        </div>
        <Button variant="secondary" onClick={onStartOver}>
          <RotateIcon className="h-4 w-4" /> New analysis
        </Button>
      </div>

      <ScoreOverview result={result} />

      <HighlightedDocument text={result.documentText} aiFindings={result.ai.findings} plagiarismFindings={result.plagiarism.findings} />

      <div className="grid gap-6 xl:grid-cols-2">
        <SignalChart result={result} />
        <RiskDistributionChart result={result} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Suggestions result={result} />
        <SignalBreakdown result={result} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <ModuleGrid result={result} />
        <div className="space-y-6">
          <ExportBar result={result} fileNames={fileNames} />
          <ApiCoverage result={result} />
        </div>
      </div>
    </motion.div>
  );
}
