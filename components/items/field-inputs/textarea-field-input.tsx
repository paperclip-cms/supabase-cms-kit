"use client";

import { Textarea } from "@/components/ui/textarea";
import { FieldConfig } from "@/lib/types";

interface TextareaFieldInputProps {
  field: FieldConfig;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function TextareaFieldInput({
  field,
  value,
  onChange,
  error,
}: TextareaFieldInputProps) {
  const placeholder =
    field.options?.find((opt) => opt.type === "placeholder")?.value?.toString() ||
    "";

  return (
    <div className="space-y-1">
      <Textarea
        id={field.slug}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className={`text-sm ${error ? "border-destructive" : ""}`}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
