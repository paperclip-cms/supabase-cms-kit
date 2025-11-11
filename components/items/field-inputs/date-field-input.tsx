"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldConfig, FieldType } from "@/lib/types";

interface DateFieldInputProps {
  field: FieldConfig;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function DateFieldInput({
  field,
  value,
  onChange,
  error,
}: DateFieldInputProps) {
  const inputType =
    field.type === FieldType.DateTime ? "datetime-local" : "date";

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
        type={inputType}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className={error ? "border-destructive" : ""}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
