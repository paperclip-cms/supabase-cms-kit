"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldConfig } from "@/lib/types";

interface SelectFieldInputProps {
  field: FieldConfig;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function SelectFieldInput({
  field,
  value,
  onChange,
  error,
}: SelectFieldInputProps) {
  const placeholder =
    field.options?.find((opt) => opt.type === "placeholder")?.value?.toString() ||
    "Select an option";

  const choices = (field.options?.find((opt) => opt.type === "choices")
    ?.value as Array<{ label: string; value: string }>) || [];

  return (
    <div className="space-y-1">
      <Select value={value || ""} onValueChange={onChange}>
        <SelectTrigger className={`text-sm ${error ? "border-destructive" : ""}`}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {choices.map((choice) => (
            <SelectItem key={choice.value} value={choice.value}>
              {choice.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
