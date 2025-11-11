"use client";

import { Input } from "@/components/ui/input";
import { FieldConfig } from "@/lib/types";

interface NumberFieldInputProps {
  field: FieldConfig;
  value: number | null;
  onChange: (value: number | null) => void;
  error?: string;
}

export function NumberFieldInput({
  field,
  value,
  onChange,
  error,
}: NumberFieldInputProps) {
  const placeholder =
    field.options
      ?.find((opt) => opt.type === "placeholder")
      ?.value?.toString() || "";

  return (
    <div className="space-y-1">
      <Input
        id={field.slug}
        type="number"
        value={value ?? ""}
        onChange={(e) => {
          const val = e.target.value;
          onChange(val === "" ? null : parseFloat(val));
        }}
        placeholder={placeholder}
        className={`text-sm ${error ? "border-destructive" : ""}`}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
