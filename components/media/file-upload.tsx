"use client";

import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { File as FileIcon, Loader2, X, Upload } from "lucide-react";

export interface UploadedFile {
  id?: string;
  url: string;
  path: string;
  name: string;
  tempId?: string;
  isUploading?: boolean;
}

interface FileUploadProps {
  file: UploadedFile | null;
  onFileChange: (
    file:
      | UploadedFile
      | null
      | ((prev: UploadedFile | null) => UploadedFile | null),
  ) => void;
  accept?: string; // HTML accept attribute: '.pdf,.doc,image/*'
  maxSize?: number; // in bytes
  disabled?: boolean;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export function FileUpload({
  file,
  onFileChange,
  accept,
  maxSize,
  disabled = false,
  onSuccess,
  onError,
}: FileUploadProps) {
  const handleDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const fileToUpload = acceptedFiles[0];

      const placeholder: UploadedFile = {
        url: "",
        path: "",
        name: fileToUpload.name,
        tempId: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        isUploading: true,
      };

      onFileChange(placeholder);

      try {
        const formData = new FormData();
        formData.append("files", fileToUpload);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const result = await response.json();

        if (result.errors && result.errors.length > 0) {
          throw new Error(result.errors[0].error);
        }

        if (result.uploaded && result.uploaded.length > 0) {
          const uploadedFile = result.uploaded[0];

          onFileChange({
            url: uploadedFile.url,
            path: uploadedFile.path,
            name: uploadedFile.name,
            isUploading: false,
          });

          onSuccess?.(`${fileToUpload.name} uploaded successfully`);
        }
      } catch (err) {
        onFileChange(null);
        const errorMessage =
          err instanceof Error ? err.message : "Upload failed";
        onError?.(errorMessage);
        console.error("Upload error:", err);
      }
    },
    [onFileChange, onSuccess, onError],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: accept ? { [accept]: [] } : undefined, // undefined = accept all
    maxSize,
    multiple: false,
    disabled: disabled || (!!file && file.isUploading),
  });

  const handleRemove = useCallback(() => {
    onFileChange(null);
  }, [onFileChange]);

  if (!file) {
    return (
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed p-6
          flex flex-col items-center justify-center
          cursor-pointer transition-colors
          min-h-[120px]
          ${
            isDragActive
              ? "border-foreground bg-muted"
              : "border-border hover:border-foreground hover:bg-muted"
          }
        `}
      >
        <input {...getInputProps()} />
        <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground text-center">
          {isDragActive
            ? "Drop file here"
            : "Drop file here or click to browse"}
        </p>
        {maxSize && (
          <p className="text-xs text-muted-foreground mt-1">
            Max size: {(maxSize / 1024 / 1024).toFixed(0)}MB
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="border border-border p-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <FileIcon className="h-6 w-6 text-muted-foreground flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm truncate">{file.name}</p>
          {file.isUploading && (
            <p className="text-xs text-muted-foreground">Uploading...</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {file.isUploading ? (
          <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
        ) : (
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled}
            className="h-8 w-8 flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
