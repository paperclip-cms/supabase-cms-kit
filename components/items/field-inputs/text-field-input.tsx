"use client";

import { Input } from "@/components/ui/input";
import { FieldConfig } from "@/lib/types";

interface TextFieldInputProps {
  field: FieldConfig;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function TextFieldInput({
  field,
  value,
  onChange,
  error,
}: TextFieldInputProps) {
  const placeholder =
    field.options?.find((opt) => opt.type === "placeholder")?.value?.toString() ||
    "";

  return (
    <div className="space-y-1">
      <Input
        id={field.slug}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`text-sm ${error ? "border-destructive" : ""}`}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
