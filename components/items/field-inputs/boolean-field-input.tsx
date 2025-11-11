"use client";

import { Switch } from "@/components/ui/switch";
import { FieldConfig } from "@/lib/types";

interface BooleanFieldInputProps {
  field: FieldConfig;
  value: boolean;
  onChange: (value: boolean) => void;
  error?: string;
}

export function BooleanFieldInput({
  field,
  value,
  onChange,
  error,
}: BooleanFieldInputProps) {
  return (
    <div className="space-y-1">
      <Switch
        id={field.slug}
        checked={value}
        onCheckedChange={onChange}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
