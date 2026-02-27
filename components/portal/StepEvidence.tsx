"use client";

import { useRef, useState, useCallback } from "react";
import { Upload, X, ImageIcon, Loader2, AlertTriangle } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import type { EvidenceFile } from "@/lib/types";

const ACCEPTED_TYPES = ["image/tiff", "image/png", "image/jpeg", "image/webp"];
const ACCEPTED_EXTENSIONS = ".tiff,.tif,.png,.jpg,.jpeg,.webp";
const MAX_SIZE_BYTES = 50 * 1024 * 1024;

interface StepEvidenceProps {
  files: EvidenceFile[];
  onAdd: (files: EvidenceFile[]) => void;
  onRemove: (id: string) => void;
  onUpdateFile: (id: string, updates: Partial<EvidenceFile>) => void;
}

function getFileExtension(name: string): string {
  const ext = name.split(".").pop()?.toUpperCase() ?? "";
  if (ext === "TIF") return "TIFF";
  if (ext === "JPG") return "JPEG";
  return ext;
}

function validateFile(file: File): string | null {
  const isValidType =
    ACCEPTED_TYPES.includes(file.type) ||
    /\.(tiff?|png|jpe?g|webp)$/i.test(file.name);

  if (!isValidType)
    return `${file.name}: Unsupported file type. Please upload JPG, PNG, or WebP files only.`;
  if (file.size === 0)
    return `${file.name}: Please select at least one image to continue.`;
  if (file.size > MAX_SIZE_BYTES)
    return `${file.name}: File is too large. Maximum size is 50MB per file.`;
  return null;
}

async function uploadFile(file: File): Promise<{
  ok: boolean;
  descriptor?: EvidenceFile;
  error?: string;
}> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/submissions/upload", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    return {
      ok: false,
      error:
        data.error ??
        "Upload failed. Please try again. If the issue persists, refresh the page and retry.",
    };
  }

  return {
    ok: true,
    descriptor: {
      id: data.file.id,
      name: data.file.name,
      type: getFileExtension(data.file.name),
      path: data.file.path,
      mimeType: data.file.mimeType,
      size: data.file.size,
      uploadedAt: data.file.uploadedAt,
      status: "done",
    },
  };
}

export function StepEvidence({
  files,
  onAdd,
  onRemove,
  onUpdateFile,
}: StepEvidenceProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileErrors, setFileErrors] = useState<string[]>([]);

  const handleFiles = useCallback(
    async (rawFiles: FileList | File[]) => {
      const errors: string[] = [];
      const validFiles: { file: File; placeholder: EvidenceFile }[] = [];

      for (const file of Array.from(rawFiles)) {
        const validationError = validateFile(file);
        if (validationError) {
          errors.push(validationError);
          continue;
        }

        const placeholderId = `ev-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const placeholder: EvidenceFile = {
          id: placeholderId,
          name: file.name,
          type: getFileExtension(file.name),
          status: "uploading",
        };
        validFiles.push({ file, placeholder });
      }

      setFileErrors(errors);

      if (validFiles.length === 0) return;

      onAdd(validFiles.map((v) => v.placeholder));

      for (const { file, placeholder } of validFiles) {
        try {
          const result = await uploadFile(file);
          if (result.ok && result.descriptor) {
            onUpdateFile(placeholder.id, {
              ...result.descriptor,
              id: placeholder.id,
            });
          } else {
            onUpdateFile(placeholder.id, {
              status: "error",
              error:
                result.error ??
                "Upload failed. Please try again. If the issue persists, refresh the page and retry.",
            });
          }
        } catch {
          onUpdateFile(placeholder.id, {
            status: "error",
            error:
              "Upload failed. Please try again. If the issue persists, refresh the page and retry.",
          });
        }
      }
    },
    [onAdd, onUpdateFile]
  );

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
      e.target.value = "";
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const doneCount = files.filter((f) => f.status === "done").length;

  return (
    <Panel>
      <h2 className="text-sm font-medium tracking-forensic text-noir-text mb-2">
        Evidence Images
      </h2>
      <div className="text-xs text-noir-muted mb-6 space-y-1">
        <p>Upload review-quality images of the artwork for initial assessment (JPG, PNG, or WebP).</p>
        <p>Maximum file size: 50MB per file.</p>
        <p>High-resolution master files may be requested after initial review.</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS}
        multiple
        className="hidden"
        onChange={handleInputChange}
        aria-label="Select evidence files"
      />

      <div
        className={`border border-dashed bg-noir-bg p-8 flex flex-col items-center gap-4 cursor-pointer transition-colors duration-120 focus-visible:outline focus-visible:outline-1 focus-visible:outline-noir-text focus-visible:outline-offset-[-1px] ${
          isDragging
            ? "border-noir-text bg-noir-surface"
            : "border-noir-border hover:border-noir-muted"
        }`}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        aria-label="Upload evidence files — click or drag and drop"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        <Upload
          className={`w-5 h-5 transition-colors ${isDragging ? "text-noir-text" : "text-noir-muted"}`}
          strokeWidth={1}
        />
        <div className="text-center">
          <p className="text-xs text-noir-text">
            {isDragging
              ? "Drop files here"
              : "Click to upload or drag and drop"}
          </p>
          <p className="text-[10px] text-noir-muted mt-1">
            JPG, PNG, or WebP — Max 50MB per file
          </p>
        </div>
      </div>

      <p className="text-[10px] text-noir-muted/70 mt-2 italic">
        Tip: 3–6 clear images usually work best (front view, detail views, signature/back if relevant).
      </p>

      {fileErrors.length > 0 && (
        <div className="mt-3 space-y-1">
          {fileErrors.map((err, i) => (
            <p key={i} className="text-[10px] text-noir-accent">
              {err}
            </p>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className={`flex items-center justify-between border bg-noir-bg px-3 py-2 ${
                file.status === "error"
                  ? "border-noir-accent/50"
                  : "border-noir-border"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                {file.status === "uploading" ? (
                  <Loader2
                    className="w-4 h-4 text-noir-muted flex-shrink-0 animate-spin"
                    strokeWidth={1}
                  />
                ) : file.status === "error" ? (
                  <AlertTriangle
                    className="w-4 h-4 text-noir-accent flex-shrink-0"
                    strokeWidth={1}
                  />
                ) : (
                  <ImageIcon
                    className="w-4 h-4 text-noir-muted flex-shrink-0"
                    strokeWidth={1}
                  />
                )}
                <span className="text-xs text-noir-text truncate">
                  {file.name}
                </span>
                {file.status === "uploading" && (
                  <span className="text-[10px] text-noir-muted flex-shrink-0">
                    Uploading…
                  </span>
                )}
                {file.status === "error" && (
                  <span className="text-[10px] text-noir-accent flex-shrink-0">
                    {file.error ??
                      "Upload failed. Please try again. If the issue persists, refresh the page and retry."}
                  </span>
                )}
                {file.status === "done" && (
                  <span className="text-[10px] text-noir-muted uppercase flex-shrink-0">
                    {file.type}
                  </span>
                )}
              </div>
              <button
                onClick={() => onRemove(file.id)}
                aria-label={`Remove ${file.name}`}
                className="text-noir-muted hover:text-noir-accent transition-colors duration-120 flex-shrink-0 ml-2 p-0.5 focus-visible:outline focus-visible:outline-1 focus-visible:outline-noir-text"
              >
                <X className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <span className="text-[10px] text-noir-muted tracking-widest uppercase">
          {doneCount} image{doneCount !== 1 ? "s" : ""} uploaded
        </span>
        <Button variant="ghost" size="sm" onClick={handleClick}>
          + Add More Files
        </Button>
      </div>
    </Panel>
  );
}
