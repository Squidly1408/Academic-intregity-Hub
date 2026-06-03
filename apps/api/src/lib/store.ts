import { randomUUID } from "node:crypto";
import type { AnalysisJob } from "../types";

const jobs = new Map<string, AnalysisJob>();

export function createJob(fileCount: number): AnalysisJob {
  const now = new Date().toISOString();
  const job: AnalysisJob = {
    id: randomUUID(),
    status: "queued",
    progress: 0,
    message: "Queued for analysis",
    createdAt: now,
    updatedAt: now,
    fileCount,
    files: []
  };

  jobs.set(job.id, job);
  return job;
}

export function saveJob(job: AnalysisJob): AnalysisJob {
  job.updatedAt = new Date().toISOString();
  jobs.set(job.id, job);
  return job;
}

export function getJob(id: string): AnalysisJob | undefined {
  return jobs.get(id);
}

export function listJobs(): AnalysisJob[] {
  return [...jobs.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
