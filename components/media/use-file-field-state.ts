import { useState, useRef, useEffect } from "react";
import { UploadedFile } from "./file-upload";

/**
 * Hook to manage file field state with proper syncing between form value and upload state.
 */
export function useFileFieldState(
  value: string,
  onChange: (value: string) => void,
) {
  const [file, setFile] = useState<UploadedFile | null>(null);

  const fileRef = useRef(file);
  fileRef.current = file;

  // Sync local state with form value when it changes externally
  useEffect(() => {
    // Don't sync if upload is in progress
    if (file?.isUploading) return;

    // If we already have a file with this URL, don't re-sync (keeps the name)
    if (file && file.url === value) return;

    const newFile: UploadedFile | null = value
      ? {
          url: value,
          path: value,
          name: value.split("/").pop() || "file", // Extract filename from URL
        }
      : null;

    if (JSON.stringify(newFile) !== JSON.stringify(file)) {
      setFile(newFile);
    }
  }, [value, file]);

  const handleFileChange = (
    newFile:
      | UploadedFile
      | null
      | ((prev: UploadedFile | null) => UploadedFile | null),
  ) => {
    const updated =
      typeof newFile === "function" ? newFile(fileRef.current) : newFile;

    setFile(updated);

    // Sync only completed upload to parent form
    if (!updated?.isUploading) {
      onChange(updated?.url || "");
    }
  };

  return {
    file,
    handleFileChange,
  };
}
