import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface UploadPanelProps {
  onSelect: (files: File[]) => void;
  isProcessing: boolean;
}

export function UploadPanel({ onSelect, isProcessing }: UploadPanelProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onSelect(acceptedFiles);
  }, [onSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
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
    <div
      {...getRootProps()}
      className={`glass cursor-pointer rounded-[2rem] border border-dashed px-6 py-8 transition duration-300 ${isDragActive ? "border-cyan-300 bg-cyan-300/10" : "border-slate-400/30"} ${isProcessing ? "opacity-60" : "hover:border-cyan-300/70 hover:bg-white/5"}`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col gap-3">
        <div className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">Upload documents</div>
        <div className="text-2xl font-semibold text-white">Drop PDFs, DOCX, TXT, RTF, or scanned images here</div>
        <div className="max-w-2xl text-sm leading-6 text-slate-200/75">
          Analyze academic writing instantly with plagiarism, citation, AI detection, readability, and source comparison in one workflow.
        </div>
      </div>
    </div>
  );
}
