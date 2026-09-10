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
        className={`group relative cursor-pointer overflow-hidden rounded-[2rem] border border-dashed px-6 py-9 text-center transition-all duration-300 sm:text-left ${
          isDragReject
            ? "border-[var(--bad-border)] bg-[var(--bad-bg)]"
            : isDragActive
              ? "scale-[1.01] border-[var(--accent)] bg-[var(--accent-soft-bg)]"
              : "border-[var(--border-strong)] bg-[var(--surface-3)] hover:border-[var(--accent-soft-border)] hover:bg-[var(--surface-4)]"
        } ${isProcessing ? "pointer-events-none opacity-50" : ""}`}
        aria-disabled={isProcessing}
      >
        <input {...getInputProps()} aria-label="Upload documents for analysis" />
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
          <div
            className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl border transition-transform duration-300 ${
              isDragActive ? "scale-110 border-[var(--accent-soft-border)] bg-[var(--accent-soft-bg)] text-[var(--accent-text)]" : "border-[var(--border)] bg-[var(--surface-4)] text-[var(--accent-text)] group-hover:scale-105"
            }`}
          >
            <UploadCloudIcon className="h-6 w-6" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-xs uppercase tracking-[0.24em] text-[var(--accent-text)]">Upload documents</div>
            <div className="text-xl font-semibold text-[var(--text-primary)] sm:text-2xl">
              {isDragActive ? "Drop it right here" : "Drag files in, or click to browse"}
            </div>
            <div className="max-w-2xl text-sm leading-6 text-[var(--text-muted)]">
              Analyze academic writing instantly with plagiarism, citation, AI detection, readability, and source comparison in one workflow.
            </div>
            <div className="mt-1 flex flex-wrap justify-center gap-1.5 sm:justify-start">
              {ACCEPTED_LABELS.map((label) => (
                <span key={label} className="chip rounded-full px-2.5 py-1 text-[0.65rem] uppercase tracking-[0.14em] text-[var(--text-faint)]">
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {rejectionMessage ? (
        <div className="rounded-2xl border border-[var(--bad-border)] bg-[var(--bad-bg)] px-4 py-2.5 text-sm text-[var(--bad)]">{rejectionMessage}</div>
      ) : null}
    </div>
  );
}
