"use client";

import { Input } from "@/components/ui/input";
import { FieldConfig } from "@/lib/types";

interface ImageFieldInputProps {
  field: FieldConfig;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function ImageFieldInput({
  field,
  value,
  onChange,
  error,
}: ImageFieldInputProps) {
  return (
    <div className="space-y-1">
      <Input
        id={field.slug}
        type="url"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://example.com/image.jpg"
        className={`text-sm ${error ? "border-destructive" : ""}`}
      />
      {value && (
        <img
          src={value}
          alt="Preview"
          className="max-w-xs rounded-lg border mt-2"
        />
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
