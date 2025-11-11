"use client";

import { Input } from "@/components/ui/input";
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
    <div className="space-y-1">
      <Input
        id={field.slug}
        type={inputType}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className={`text-sm ${error ? "border-destructive" : ""}`}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
