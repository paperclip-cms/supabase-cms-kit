"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { OptionInputProps } from "./index";

/**
 * Input component for number-type options (maxSize, etc.)
 */
export function NumberOptionInput({
  value,
  onChange,
  config,
}: OptionInputProps) {
  const numberValue = typeof value === "number" ? value : "";

  return (
    <div className="space-y-2">
      <Label>{config.label}</Label>
      <div className="flex gap-2 items-center">
        <Input
          type="number"
          placeholder={config.placeholder}
          value={numberValue}
          onChange={(e) =>
            onChange(e.target.value ? Number(e.target.value) : undefined)
          }
          min={0}
        />
        {config.suffix && (
          <span className="text-sm text-muted-foreground">{config.suffix}</span>
        )}
      </div>
      {config.helpText && (
        <p className="text-xs text-muted-foreground">{config.helpText}</p>
      )}
    </div>
  );
}
