"use client";

import * as React from "react";
import { FieldConfig, BuiltInFieldSettings } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PencilIcon, TrashIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BaseFieldInfo {
  slug: string;
  label: string;
  type: string;
}

interface FieldRowProps {
  field: BaseFieldInfo | FieldConfig;
  settings?: BuiltInFieldSettings;
  isBuiltIn?: boolean;
  isCore?: boolean;
  required?: boolean;
  copiedSlug?: string | null;
  onCopySlug?: (slug: string) => void;
  onVisibilityChange?: (visible: boolean, required: boolean) => void;
  onRequiredChange?: (required: boolean) => void;
  onEdit?: (field: FieldConfig) => void;
  onDelete?: (slug: string) => void;
}

/**
 * Unified field row component for both built-in and custom fields
 * Eliminates duplicate rendering logic
 */
export function FieldRow({
  field,
  settings,
  isBuiltIn = false,
  isCore = false,
  required = false,
  copiedSlug,
  onCopySlug,
  onVisibilityChange,
  onRequiredChange,
  onEdit,
  onDelete,
}: FieldRowProps) {
  const copied = copiedSlug === field.slug;
  const fieldType = "type" in field ? field.type : "text";

  return (
    <div className="flex items-center gap-4 px-4 py-2.5 hover:bg-accent/50 transition-colors group">
      {/* Visibility checkbox (built-in fields only) */}
      {isBuiltIn && settings && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Checkbox
                checked={isCore || settings.visible}
                disabled={isCore}
                onCheckedChange={(checked) =>
                  onVisibilityChange?.(
                    checked as boolean,
                    checked ? settings.required : false,
                  )
                }
              />
            </div>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>
              {isCore
                ? "Always visible"
                : settings.visible
                  ? "Hide from forms"
                  : "Show in forms"}
            </p>
          </TooltipContent>
        </Tooltip>
      )}

      {/* Field info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{field.label}</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <code
                className="text-xs px-1.5 py-0.5 bg-muted/50 rounded font-mono text-muted-foreground hover:bg-muted cursor-pointer transition-colors"
                onClick={() => onCopySlug?.(field.slug)}
              >
                {field.slug}
              </code>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>{copied ? "Copied!" : "Click to copy"}</p>
            </TooltipContent>
          </Tooltip>
          <span className="text-xs text-muted-foreground">
            • {fieldType.toLowerCase()}
          </span>
          {!isBuiltIn && required && (
            <span className="text-xs text-muted-foreground">• Required</span>
          )}
        </div>
      </div>

      {/* Required checkbox (built-in fields only) */}
      {isBuiltIn && settings && (
        <Tooltip>
          <TooltipTrigger asChild>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={isCore || settings.required}
                disabled={isCore || !settings.visible}
                onCheckedChange={(checked) =>
                  onRequiredChange?.(checked as boolean)
                }
              />
              <span className="text-xs text-muted-foreground min-w-[60px]">
                Required
              </span>
            </label>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>
              {isCore
                ? "Always required"
                : !settings.visible
                  ? "Field must be visible to be required"
                  : settings.required
                    ? "Make optional"
                    : "Make required"}
            </p>
          </TooltipContent>
        </Tooltip>
      )}

      {/* Actions (custom fields only) */}
      {!isBuiltIn && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit?.(field as FieldConfig)}
          >
            <PencilIcon />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete?.(field.slug)}
          >
            <TrashIcon />
          </Button>
        </div>
      )}
    </div>
  );
}
