import { FieldConfig, FieldOption } from "./types";
import { FieldOptionValue } from "./field-options";

/**
 * Field Configuration Utilities
 *
 * Simple utility functions for working with field configs.
 * No classes, no boilerplate - just the useful stuff.
 */

/**
 * Convert megabytes to bytes for storage
 */
export function convertMBToBytes(mb: number): number {
  if (mb <= 0) throw new Error("Max size must be positive");
  if (mb > 1000) throw new Error("Max size cannot exceed 1000 MB");
  return mb * 1024 * 1024;
}

/**
 * Convert bytes to megabytes for display
 */
export function convertBytesToMB(bytes: number): number {
  return bytes / (1024 * 1024);
}

/**
 * Convert FieldConfig to options map for form editing
 * Handles unit conversions (bytes → MB)
 */
export function fieldConfigToOptionsMap(
  config: FieldConfig,
): Record<string, FieldOptionValue> {
  const optionsMap: Record<string, FieldOptionValue> = {};

  if (config.options) {
    for (const option of config.options) {
      // Convert bytes to MB for maxSize
      if (option.type === "maxSize" && typeof option.value === "number") {
        optionsMap[option.type] = convertBytesToMB(option.value);
      } else {
        optionsMap[option.type] = option.value as FieldOptionValue;
      }
    }
  }

  return optionsMap;
}

/**
 * Convert options map from form to FieldOption array
 * Handles unit conversions (MB → bytes) and filtering
 */
export function optionsMapToFieldOptions(
  optionsData: Record<string, FieldOptionValue>,
): FieldOption[] {
  const optionsArray: FieldOption[] = [];

  for (const [key, value] of Object.entries(optionsData)) {
    if (value === undefined || value === null) continue;

    // Filter out empty arrays
    if (Array.isArray(value) && value.length === 0) continue;

    // Handle choices - filter out incomplete entries
    if (key === "choices" && Array.isArray(value)) {
      const choices = value as Array<{ label: string; value: string }>;
      const validChoices = choices.filter((c) => c.label && c.value);
      if (validChoices.length === 0) continue;
      optionsArray.push({ type: key, value: validChoices });
    }
    // Handle maxSize - convert MB to bytes
    else if (key === "maxSize" && typeof value === "number") {
      optionsArray.push({
        type: key,
        value: convertMBToBytes(value),
      });
    }
    // All other options
    else {
      optionsArray.push({ type: key, value });
    }
  }

  return optionsArray;
}
