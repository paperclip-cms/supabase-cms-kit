"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusIcon, XIcon } from "lucide-react";
import type { OptionInputProps } from "./index";
import { useState } from "react";

/**
 * Input component for choice array options (Select/MultiSelect choices)
 */
export function ChoiceArrayOptionInput({
  value,
  onChange,
  config,
}: OptionInputProps) {
  const [newLabel, setNewLabel] = useState("");
  const [newValue, setNewValue] = useState("");

  const choices = Array.isArray(value)
    ? (value as Array<{ label: string; value: string }>)
    : [];

  const handleAdd = () => {
    if (newLabel.trim() && newValue.trim()) {
      onChange([
        ...choices,
        { label: newLabel.trim(), value: newValue.trim() },
      ]);
      setNewLabel("");
      setNewValue("");
    }
  };

  const handleRemove = (index: number) => {
    onChange(choices.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <Label>{config.label}</Label>
      <div className="space-y-2 p-3 border rounded-md">
        {choices.length > 0 && (
          <div className="space-y-2 mb-3">
            {choices.map((choice, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 bg-secondary/50 rounded"
              >
                <div className="flex-1 grid grid-cols-2 gap-2 text-sm">
                  <span className="font-medium">{choice.label}</span>
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">
                    {choice.value}
                  </code>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleRemove(index)}
                >
                  <XIcon className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Label (e.g., Draft)"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAdd();
                }
              }}
            />
            <Input
              placeholder="Value (e.g., draft)"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAdd();
                }
              }}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAdd}
            disabled={!newLabel.trim() || !newValue.trim()}
            className="w-full"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Choice
          </Button>
        </div>
      </div>
      {config.helpText && (
        <p className="text-xs text-muted-foreground">{config.helpText}</p>
      )}
    </div>
  );
}
