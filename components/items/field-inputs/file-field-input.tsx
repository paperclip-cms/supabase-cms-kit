"use client";

import { FieldConfig } from "@/lib/types";
import { FileUpload } from "@/components/media/file-upload";
import { useFileFieldState } from "@/components/media/use-file-field-state";
import { toast } from "sonner";

interface FileFieldInputProps {
  field: FieldConfig;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function FileFieldInput({
  field,
  value,
  onChange,
  error,
}: FileFieldInputProps) {
  const { file, handleFileChange } = useFileFieldState(value, onChange);

  // Get accept and maxSize from field options
  const acceptOption = field.options?.find((opt) => opt.type === "accept");
  const maxSizeOption = field.options?.find((opt) => opt.type === "maxSize");

  const accept = acceptOption
    ? Array.isArray(acceptOption.value)
      ? (acceptOption.value as string[]).join(",")
      : undefined
    : undefined;

  const maxSize =
    typeof maxSizeOption?.value === "number"
      ? maxSizeOption.value // Already in bytes
      : undefined;

  return (
    <div className="space-y-1">
      <FileUpload
        file={file}
        onFileChange={handleFileChange}
        accept={accept}
        maxSize={maxSize}
        onSuccess={(message) => toast.success(message)}
        onError={(message) => toast.error(message)}
      />
      {error && <p className="text-xs text-destructive mt-2">{error}</p>}
    </div>
  );
}
