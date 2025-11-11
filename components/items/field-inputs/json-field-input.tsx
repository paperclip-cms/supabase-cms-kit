"use client";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
    <div className="space-y-2">
      <Label htmlFor={field.slug}>
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {field.description && (
        <p className="text-sm text-muted-foreground">{field.description}</p>
      )}
      <Textarea
        id={field.slug}
        value={textValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="{}"
        rows={6}
        className={`font-mono text-sm ${error || jsonError ? "border-destructive" : ""}`}
      />
      {(error || jsonError) && (
        <p className="text-sm text-destructive">{error || jsonError}</p>
      )}
    </div>
  );
}
