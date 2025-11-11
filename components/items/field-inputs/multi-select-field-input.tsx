"use client";

import { Label } from "@/components/ui/label";
import { FieldConfig } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";

interface MultiSelectFieldInputProps {
  field: FieldConfig;
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
}

export function MultiSelectFieldInput({
  field,
  value,
  onChange,
  error,
}: MultiSelectFieldInputProps) {
  const choices = (field.options?.find((opt) => opt.type === "choices")
    ?.value as Array<{ label: string; value: string }>) || [];

  const handleToggle = (choiceValue: string) => {
    const currentValues = value || [];
    if (currentValues.includes(choiceValue)) {
      onChange(currentValues.filter((v) => v !== choiceValue));
    } else {
      onChange([...currentValues, choiceValue]);
    }
  };

  return (
    <div className="space-y-2">
      <Label>
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {field.description && (
        <p className="text-sm text-muted-foreground">{field.description}</p>
      )}
      <div className="space-y-2 border rounded-lg p-3">
        {choices.map((choice) => (
          <div key={choice.value} className="flex items-center gap-2">
            <Checkbox
              id={`${field.slug}-${choice.value}`}
              checked={(value || []).includes(choice.value)}
              onCheckedChange={() => handleToggle(choice.value)}
            />
            <Label
              htmlFor={`${field.slug}-${choice.value}`}
              className="cursor-pointer font-normal"
            >
              {choice.label}
            </Label>
          </div>
        ))}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
