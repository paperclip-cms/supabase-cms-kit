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
  const choices =
    (field.options?.find((opt) => opt.type === "choices")?.value as Array<{
      label: string;
      value: string;
    }>) || [];

  const handleToggle = (choiceValue: string) => {
    const currentValues = value || [];
    if (currentValues.includes(choiceValue)) {
      onChange(currentValues.filter((v) => v !== choiceValue));
    } else {
      onChange([...currentValues, choiceValue]);
    }
  };

  return (
    <div className="space-y-1">
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
              className="cursor-pointer font-normal text-sm"
            >
              {choice.label}
            </Label>
          </div>
        ))}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
