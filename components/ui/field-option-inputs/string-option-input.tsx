"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { OptionInputProps } from "./index";

/**
 * Input component for string-type options (placeholder, defaultValue, etc.)
 */
export function StringOptionInput({
  value,
  onChange,
  config,
}: OptionInputProps) {
  const stringValue = typeof value === "string" ? value : "";

  return (
    <div className="space-y-2">
      <Label>{config.label}</Label>
      <Input
        placeholder={config.placeholder}
        value={stringValue}
        onChange={(e) => onChange(e.target.value || undefined)}
      />
      {config.helpText && (
        <p className="text-xs text-muted-foreground">{config.helpText}</p>
      )}
    </div>
  );
}
