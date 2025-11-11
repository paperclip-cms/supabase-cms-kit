"use client";

import { Input } from "@/components/ui/input";
import { FieldConfig } from "@/lib/types";

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
  return (
    <div className="space-y-1">
      <Input
        id={field.slug}
        type="url"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://example.com/file.pdf"
        className={`text-sm ${error ? "border-destructive" : ""}`}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
