"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusIcon, XIcon } from "lucide-react";
import type { OptionInputProps } from "./index";
import { useState } from "react";

/**
 * Input component for string array options (file accept types, etc.)
 */
export function StringArrayOptionInput({
  value,
  onChange,
  config,
}: OptionInputProps) {
  const [input, setInput] = useState("");
  const items = Array.isArray(value) ? (value as string[]) : [];

  const handleAdd = () => {
    if (input.trim()) {
      onChange([...items, input.trim()]);
      setInput("");
    }
  };

  const handleRemove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <Label>{config.label}</Label>
      <div className="flex gap-2">
        <Input
          placeholder={config.placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleAdd}
          disabled={!input.trim()}
        >
          <PlusIcon className="h-4 w-4" />
        </Button>
      </div>
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-1 px-2 py-1 bg-secondary rounded-md text-sm"
            >
              <span>{item}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0"
                onClick={() => handleRemove(index)}
              >
                <XIcon className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
      {config.helpText && (
        <p className="text-xs text-muted-foreground">{config.helpText}</p>
      )}
    </div>
  );
}
