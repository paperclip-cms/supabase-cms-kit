"use client";

import { Textarea } from "@/components/ui/textarea";
import { FieldConfig } from "@/lib/types";
import { useState } from "react";

interface JsonFieldInputProps {
  field: FieldConfig;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
}

export function JsonFieldInput({
  field,
  value,
  onChange,
  error,
}: JsonFieldInputProps) {
  const [textValue, setTextValue] = useState(() => {
    try {
      return JSON.stringify(value, null, 2) || "{}";
    } catch {
      return "{}";
    }
  });
  const [jsonError, setJsonError] = useState<string | null>(null);

  const handleChange = (text: string) => {
    setTextValue(text);
    try {
      const parsed = JSON.parse(text);
      setJsonError(null);
      onChange(parsed);
    } catch (e) {
      setJsonError("Invalid JSON");
    }
  };

  return (
    <div className="space-y-1">
      <Textarea
        id={field.slug}
        value={textValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="{}"
        rows={6}
        className={`font-mono text-sm ${error || jsonError ? "border-destructive" : ""}`}
      />
      {(error || jsonError) && (
        <p className="text-xs text-destructive">{error || jsonError}</p>
      )}
    </div>
  );
}
