"use client";

import React, { useCallback, useRef, useState } from "react";
import { validateImageFile } from "@/lib/api";

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
  onValidationError: (msg: string) => void;
  disabled?: boolean;
}

export default function UploadZone({
  onFileSelected,
  onValidationError,
  disabled = false,
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      const error = validateImageFile(file);
      if (error) {
        onValidationError(error);
        return;
      }
      onFileSelected(file);
    },
    [onFileSelected, onValidationError]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [disabled, handleFile]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) setIsDragging(true);
    },
    [disabled]
  );

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      // reset so re-uploading same file works
      e.target.value = "";
    },
    [handleFile]
  );

  return (
    <div
      id="upload-zone"
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="Upload fruit image by clicking or dragging"
      aria-disabled={disabled}
      onClick={() => !disabled && fileInputRef.current?.click()}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !disabled) {
          fileInputRef.current?.click();
        }
      }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={[
        "relative flex flex-col items-center justify-center gap-5",
        "w-full min-h-64 rounded-2xl border-2 border-dashed",
        "transition-all duration-300 cursor-pointer select-none",
        "focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-surface-bg",
        isDragging
          ? "dropzone-active"
          : "border-surface-border hover:border-brand/60 hover:bg-brand/[0.03]",
        disabled ? "opacity-40 cursor-not-allowed" : "",
      ].join(" ")}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        id="file-input"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleInputChange}
        disabled={disabled}
        aria-hidden="true"
      />

      {/* Icon */}
      <div
        className={[
          "w-20 h-20 rounded-full flex items-center justify-center",
          "bg-brand/10 border border-brand/20 transition-transform duration-300",
          isDragging ? "scale-110" : "group-hover:scale-105",
        ].join(" ")}
      >
        <svg
          className="w-9 h-9 text-brand"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
          />
        </svg>
      </div>

      {/* Text */}
      <div className="text-center space-y-1.5 px-6">
        <p className="text-base font-semibold text-text-primary">
          {isDragging ? "Drop your image here" : "Drag & drop your fruit image"}
        </p>
        <p className="text-sm text-text-secondary">
          or{" "}
          <span className="text-brand font-medium underline underline-offset-2">
            click to browse
          </span>
        </p>
        <p className="text-xs text-text-secondary/70 mt-2">
          Supports JPG, PNG, WEBP · Max 10 MB
        </p>
      </div>
    </div>
  );
}
