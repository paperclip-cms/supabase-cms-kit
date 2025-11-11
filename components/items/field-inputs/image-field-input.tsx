"use client";

import { Label } from "@/components/ui/label";
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
        placeholder="https://example.com/image.jpg"
        className={error ? "border-destructive" : ""}
      />
      {value && (
        <div className="mt-2">
          <img
            src={value}
            alt={field.label}
            className="max-w-xs rounded-lg border"
          />
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
      <p className="text-xs text-muted-foreground">
        Enter an image URL. File uploads coming soon.
      </p>
    </div>
  );
}
