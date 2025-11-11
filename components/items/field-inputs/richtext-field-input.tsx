"use client";

import { Label } from "@/components/ui/label";
import { FieldConfig } from "@/lib/types";
import { RichTextEditor } from "../rich-text-editor";

interface RichTextFieldInputProps {
  field: FieldConfig;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function RichTextFieldInput({
  field,
  value,
  onChange,
  error,
}: RichTextFieldInputProps) {
  const placeholder =
    field.options?.find((opt) => opt.type === "placeholder")?.value?.toString() ||
    "Start writing...";

  const outputFormat =
    (field.options?.find((opt) => opt.type === "defaultOutput")?.value?.toString() as "markdown" | "html") ||
    "html";

  return (
    <div className="space-y-2">
      <Label htmlFor={field.slug}>
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {field.description && (
        <p className="text-sm text-muted-foreground">{field.description}</p>
      )}
      <RichTextEditor
        content={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        outputFormat={outputFormat}
        className={error ? "border-destructive" : ""}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
