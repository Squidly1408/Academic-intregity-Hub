import { Router, type Request, type Response } from "express";
import multer from "multer";
import { z } from "zod";
import { runAnalysis } from "./lib/analysis";
import { extractText, type MemoryUpload } from "./lib/extract";
import { assertSafeUpload, detectSuspiciousPatterns } from "./lib/security";
import { buildDocxReport, buildHtmlReport, buildPdfReport } from "./lib/report";
import { createJob, getJob, listJobs, saveJob } from "./lib/store";
import type { AnalysisJob, AnalysisMode, UploadedFileInfo } from "./types";
import type { AnalysisQueue } from "./lib/queue";

export interface RouteContext {
  emitJobUpdate: (job: AnalysisJob) => void;
  queue: AnalysisQueue;
  maxUploadBytes: number;
}

async function processJob(jobId: string, files: UploadedFileInfo[], language: string, mode: AnalysisMode, context: RouteContext): Promise<void> {
  try {
    saveJob({
      ...getJob(jobId)!,
      status: "processing",
      progress: 8,
      message: "Extracting text and validating files",
      files
    });
    context.emitJobUpdate(getJob(jobId)!);

    const result = await runAnalysis({ files, language });
    const completed = saveJob({
      ...getJob(jobId)!,
      status: "completed",
      progress: 100,
      message: mode === "compare" ? "Comparison analysis complete" : "Analysis complete",
      result
    });
    context.emitJobUpdate(completed);
  } catch (error) {
    const failed = saveJob({
      ...getJob(jobId)!,
      status: "failed",
      progress: 100,
      message: "Analysis failed",
      error: (error as Error).message
    });
    context.emitJobUpdate(failed);
  }
}

export function createRoutes(context: RouteContext): Router {
  const router = Router();
  const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: context.maxUploadBytes } });

  router.get("/health", (_req, res) => {
    res.json({ ok: true, timestamp: new Date().toISOString() });
  });

  router.get("/jobs", (_req, res) => {
    res.json({ jobs: listJobs() });
  });

  router.get("/jobs/:id", (req, res) => {
    const job = getJob(req.params.id);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }
    return res.json({ job });
  });

  router.post("/analyze", upload.array("files", 8), async (req: Request, res: Response) => {
    const mode = z.enum(["single", "compare"]).catch("single").parse(req.body.mode ?? "single");
    const language = z.string().optional().default("en").parse(req.body.language);
    const files = (req.files ?? []) as Express.Multer.File[];

    if (!files.length) {
      return res.status(400).json({ error: "Upload at least one document" });
    }

    const job = createJob(files.length);
    saveJob({ ...job, status: "queued", progress: 0, message: "Queued for analysis" });
    context.emitJobUpdate(getJob(job.id)!);

    const extractedFiles: UploadedFileInfo[] = [];

    try {
      await Promise.all(
        files.map(async (file, index) => {
          assertSafeUpload(file.originalname, file.mimetype, file.size, context.maxUploadBytes);
          const extractedText = await extractText(file as MemoryUpload);
          const warnings = detectSuspiciousPatterns(extractedText);
          extractedFiles[index] = {
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            extractedText
          };

          saveJob({
            ...getJob(job.id)!,
            progress: Math.min(50, 12 + index * 10),
            message: warnings.length ? `Security review complete for ${file.originalname}` : `Extracted ${file.originalname}`,
            files: extractedFiles.filter(Boolean)
          });
          context.emitJobUpdate(getJob(job.id)!);
        })
      );
    } catch (error) {
      const failed = saveJob({
        ...getJob(job.id)!,
        status: "failed",
        progress: 100,
        message: "Upload validation failed",
        error: (error as Error).message
      });
      context.emitJobUpdate(failed);
      return res.status(400).json({ error: (error as Error).message, job: failed });
    }

    saveJob({
      ...getJob(job.id)!,
      progress: 58,
      message: mode === "compare" ? "Comparing documents and running detectors" : "Running integrity detectors",
      files: extractedFiles
    });
    context.emitJobUpdate(getJob(job.id)!);

    void context.queue.enqueue(async () => {
      await processJob(job.id, extractedFiles, language, mode, context);
    });

    return res.status(202).json({ job: getJob(job.id) });
  });

  router.get("/reports/:id", async (req, res) => {
    const job = getJob(req.params.id);
    if (!job?.result) {
      return res.status(404).json({ error: "Completed report not found" });
    }

    const format = z.enum(["html", "pdf", "docx"]).catch("html").parse(req.query.format ?? "html");
    if (format === "html") {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.send(buildHtmlReport(job, job.result));
    }

    if (format === "pdf") {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=report-${job.id}.pdf`);
      return res.send(await buildPdfReport(job, job.result));
    }

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.setHeader("Content-Disposition", `attachment; filename=report-${job.id}.docx`);
    return res.send(await buildDocxReport(job, job.result));
  });

  return router;
}
