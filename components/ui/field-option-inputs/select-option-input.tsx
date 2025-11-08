"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { OptionInputProps } from "./index";

/**
 * Input component for select-type options (defaultOutput, etc.)
 */
export function SelectOptionInput({
  value,
  onChange,
  config,
}: OptionInputProps) {
  const stringValue = typeof value === "string" ? value : undefined;

  return (
    <div className="space-y-2">
      <Label>{config.label}</Label>
      <Select value={stringValue} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={config.placeholder || "Select an option"} />
        </SelectTrigger>
        <SelectContent>
          {config.choices?.map((choice) => (
            <SelectItem key={choice.value} value={choice.value}>
              {choice.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {config.helpText && (
        <p className="text-xs text-muted-foreground">{config.helpText}</p>
      )}
    </div>
  );
}
