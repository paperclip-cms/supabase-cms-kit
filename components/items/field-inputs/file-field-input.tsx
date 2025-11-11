"use client";

import { Label } from "@/components/ui/label";
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
    <div className="space-y-2">
      <Label htmlFor={field.slug}>
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {field.description && (
        <p className="text-sm text-muted-foreground">{field.description}</p>
      )}
      <Input
        id={field.slug}
        type="url"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://example.com/file.pdf"
        className={error ? "border-destructive" : ""}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <p className="text-xs text-muted-foreground">
        Enter a file URL. File uploads coming soon.
      </p>
    </div>
  );
}
