"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Checkbox
          id={field.slug}
          checked={value}
          onCheckedChange={(checked) => onChange(checked === true)}
        />
        <Label htmlFor={field.slug} className="cursor-pointer">
          {field.label}
          {field.required && <span className="text-destructive ml-1">*</span>}
        </Label>
      </div>
      {field.description && (
        <p className="text-sm text-muted-foreground">{field.description}</p>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
