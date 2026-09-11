import { useCallback, useState } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { UploadCloudIcon } from "./icons";

interface UploadPanelProps {
  onSelect: (files: File[]) => void;
  isProcessing: boolean;
}

const ACCEPTED_LABELS = ["PDF", "DOCX", "TXT", "RTF", "PNG", "JPG", "WEBP"];

export function UploadPanel({ onSelect, isProcessing }: UploadPanelProps) {
  const [rejectionMessage, setRejectionMessage] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      if (fileRejections.length) {
        setRejectionMessage(`${fileRejections.length === 1 ? "That file isn't" : "Some files aren't"} a supported format.`);
      } else {
        setRejectionMessage(null);
      }
      if (acceptedFiles.length) {
        onSelect(acceptedFiles);
      }
    },
    [onSelect]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    multiple: true,
    disabled: isProcessing,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"],
      "application/rtf": [".rtf"],
      "text/rtf": [".rtf"],
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/webp": [".webp"]
    }
  });

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`group relative cursor-pointer rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors duration-200 sm:text-left ${
          isDragReject
            ? "border-[var(--bad-border)] bg-[var(--bad-bg)]"
            : isDragActive
              ? "border-[var(--accent)] bg-[var(--accent-soft-bg)]"
              : "border-[var(--border-strong)] bg-[var(--surface-muted)] hover:border-[var(--accent-soft-border)] hover:bg-[var(--surface-hover)]"
        } ${isProcessing ? "pointer-events-none opacity-50" : ""}`}
        aria-disabled={isProcessing}
      >
        <input {...getInputProps()} aria-label="Upload documents for analysis" />
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
          <div
            className={`grid h-14 w-14 shrink-0 place-items-center rounded-xl border transition-transform duration-200 ${
              isDragActive ? "scale-105 border-[var(--accent-soft-border)] bg-[var(--surface)] text-[var(--accent-text)]" : "border-[var(--border)] bg-[var(--surface)] text-[var(--accent-text)]"
            }`}
          >
            <UploadCloudIcon className="h-6 w-6" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-xl font-semibold text-[var(--text-primary)] sm:text-2xl">
              {isDragActive ? "Drop it right here" : "Drag files in, or click to browse"}
            </div>
            <div className="max-w-2xl text-sm leading-6 text-[var(--text-muted)]">
              Analyze academic writing for AI phrasing, plagiarism, citation issues, and writing quality — all in one pass.
            </div>
            <div className="mt-1 flex flex-wrap justify-center gap-1.5 sm:justify-start">
              {ACCEPTED_LABELS.map((label) => (
                <span key={label} className="rounded border border-[var(--border)] bg-[var(--surface)] px-2 py-0.5 text-[0.65rem] uppercase tracking-[0.1em] text-[var(--text-faint)]">
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {rejectionMessage ? (
        <div role="alert" className="rounded-lg border border-[var(--bad-border)] bg-[var(--bad-bg)] px-4 py-2.5 text-sm text-[var(--bad)]">
          {rejectionMessage}
        </div>
      ) : null}
    </div>
  );
}
