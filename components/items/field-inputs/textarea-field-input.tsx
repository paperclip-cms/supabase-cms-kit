"use client";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
    <div className="space-y-2">
      <Label htmlFor={field.slug}>
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {field.description && (
        <p className="text-sm text-muted-foreground">{field.description}</p>
      )}
      <Textarea
        id={field.slug}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className={error ? "border-destructive" : ""}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
