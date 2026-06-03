import type { JobPayload } from "./types";

const baseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8787";

export async function startAnalysis(files: File[], mode: "single" | "compare", language: string): Promise<JobPayload> {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  formData.append("mode", mode);
  formData.append("language", language);

  const response = await fetch(`${baseUrl}/api/analyze`, { method: "POST", body: formData });
  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error ?? "Analysis request failed");
  }

  const data = (await response.json()) as { job: JobPayload };
  return data.job;
}

export async function loadJob(jobId: string): Promise<JobPayload> {
  const response = await fetch(`${baseUrl}/api/jobs/${jobId}`);
  if (!response.ok) {
    throw new Error("Job not found");
  }
  const data = (await response.json()) as { job: JobPayload };
  return data.job;
}

export function reportUrl(jobId: string, format: "html" | "pdf" | "docx"): string {
  return `${baseUrl}/api/reports/${jobId}?format=${format}`;
}
