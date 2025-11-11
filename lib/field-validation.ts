import { z } from "zod";
import { FieldType, type FieldOption } from "./types";
import {
  OPTION_UI_CONFIG,
  OptionValueType,
  type OptionKey,
  BUILT_IN_FIELDS,
} from "./field-options";

/**
 * Field Validation Module
 *
 * This module provides Zod schemas for validating field configurations.
 * Validation is automatically derived from OPTION_UI_CONFIG, so adding
 * new options doesn't require updating schemas - just update OPTION_UI_CONFIG.
 *
 * Key Design Decision: We use runtime validation with Zod instead of
 * compile-time discriminated unions because:
 * - Adding new options should be trivial (1-2 lines)
 * - Config-driven systems need flexibility
 * - Better error messages for users
 * - No TypeScript errors during incremental development
 */

// Import field slug schema from schemas.ts (snake_case for object properties)
import { fieldSlugSchema } from "./schemas";

/**
 * Map option value types to their corresponding Zod schemas
 */
function getValueSchemaForType(valueType: OptionValueType): z.ZodSchema {
  switch (valueType) {
    case OptionValueType.String:
      return z.string().min(1, "Value cannot be empty");

    case OptionValueType.Number:
      return z.number().positive("Must be a positive number");

    case OptionValueType.StringArray:
      return z
        .array(z.string().min(1, "Array items cannot be empty"))
        .min(1, "At least one value is required");

    case OptionValueType.ChoiceArray:
      return z
        .array(
          z.object({
            label: z.string().min(1, "Choice label is required"),
            value: z.string().min(1, "Choice value is required"),
          }),
        )
        .min(1, "At least one choice is required");

    case OptionValueType.Select:
      return z.string().min(1, "Selection is required");

    default:
      // Unknown value type - allow it but ensure it's defined
      return z.unknown().refine((val) => val !== undefined, {
        message: "Value cannot be undefined",
      });
  }
}

/**
 * Validates a single field option based on its type
 *
 * This uses superRefine to dynamically validate based on OPTION_UI_CONFIG.
 * Unknown option types are rejected - OPTION_UI_CONFIG is the single source of truth.
 */
export const fieldOptionSchema: z.ZodSchema = z
  .object({
    type: z.string().min(1, "Option type is required"),
    value: z.unknown(),
  })
  .superRefine((option, ctx) => {
    const config = OPTION_UI_CONFIG[option.type as OptionKey];

    // Unknown option type - reject it
    if (!config) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["type"],
        message: `Unknown option type: "${option.type}". Valid types: ${Object.keys(OPTION_UI_CONFIG).join(", ")}`,
      });
      return;
    }

    // Validate the value matches the expected type
    const valueSchema = getValueSchemaForType(config.valueType);
    const result = valueSchema.safeParse(option.value);

    if (!result.success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["value"],
        message: result.error.issues[0].message,
      });
    }

    // Additional validation for specific option types
    if (option.type === "maxSize" && typeof option.value === "number") {
      // maxSize is stored in bytes, should be reasonable
      const maxSizeInMB = option.value / (1024 * 1024);
      if (maxSizeInMB > 1000) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["value"],
          message: "Maximum file size cannot exceed 1000 MB",
        });
      }
    }

    if (option.type === "choices" && Array.isArray(option.value)) {
      const choices = option.value as Array<{ label: string; value: string }>;
      // Check for duplicate values
      const values = choices.map((c) => c.value);
      const uniqueValues = new Set(values);
      if (values.length !== uniqueValues.size) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["value"],
          message: "Choice values must be unique",
        });
      }
    }
  });

/**
 * Validates a complete field configuration
 *
 * Includes validation for:
 * - Slug format (snake_case for object properties)
 * - Label presence
 * - Valid field type
 * - Options array (if present)
 */
export const fieldConfigSchema = z
  .object({
    slug: fieldSlugSchema,
    label: z
      .string()
      .min(1, "Field label is required")
      .max(100, "Field label must be 100 characters or less"),
    type: z.nativeEnum(FieldType),
    required: z.boolean(),
    description: z
      .string()
      .max(500, "Description must be 500 characters or less")
      .optional(),
    options: z.array(fieldOptionSchema).optional(),
  })
  .superRefine((field, ctx) => {
    // Validate that Select/MultiSelect fields have choices
    if (
      (field.type === FieldType.Select ||
        field.type === FieldType.MultiSelect) &&
      field.options
    ) {
      const hasChoices = field.options.some(
        (opt) => (opt as FieldOption).type === "choices",
      );
      if (!hasChoices) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["options"],
          message: `${field.type} fields must have a "choices" option`,
        });
      }
    }

    // Validate that File fields have accept types
    if (field.type === FieldType.File && field.options) {
      const hasAccept = field.options.some(
        (opt) => (opt as FieldOption).type === "accept",
      );
      if (!hasAccept) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["options"],
          message: "File fields should specify accepted file types",
        });
      }
    }
  });

/**
 * Type inferred from fieldConfigSchema for use in components
 */
export type FieldConfigData = z.infer<typeof fieldConfigSchema>;

/**
 * Validates built-in field settings
 */
export const builtInFieldSettingsSchema = z.object({
  visible: z.boolean(),
  required: z.boolean(),
});

/**
 * Type inferred from builtInFieldSettingsSchema
 */
export type BuiltInFieldSettingsData = z.infer<
  typeof builtInFieldSettingsSchema
>;

/**
 * Validates a complete collection configuration
 *
 * Includes validation for:
 * - Custom fields array (if present)
 * - Built-in field settings (if present)
 * - Uniqueness of custom field slugs
 */
export const collectionConfigSchema = z
  .object({
    customFields: z.array(fieldConfigSchema).optional(),
    builtInFields: z.record(z.string(), builtInFieldSettingsSchema).optional(),
  })
  .superRefine((config, ctx) => {
    // Validate custom field slug uniqueness
    if (config.customFields && config.customFields.length > 0) {
      const slugs = config.customFields.map((f) => f.slug);
      const uniqueSlugs = new Set(slugs);

      if (slugs.length !== uniqueSlugs.size) {
        // Find duplicate slugs
        const duplicates = slugs.filter(
          (slug, index) => slugs.indexOf(slug) !== index,
        );
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["customFields"],
          message: `Duplicate field slugs found: ${duplicates.join(", ")}`,
        });
      }
    }

    // Note: We don't need to validate that at least one field is visible
    // because core fields (title, slug) are always visible and cannot be hidden
  });

/**
 * Type inferred from collectionConfigSchema
 */
export type CollectionConfigData = z.infer<typeof collectionConfigSchema>;

/**
 * Helper function to validate field config and return typed errors
 */
export function validateFieldConfig(field: unknown): {
  success: boolean;
  data?: FieldConfigData;
  error?: string;
} {
  const result = fieldConfigSchema.safeParse(field);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    error: result.error.issues[0].message,
  };
}

/**
 * Helper function to validate collection config and return typed errors
 */
export function validateCollectionConfig(config: unknown): {
  success: boolean;
  data?: CollectionConfigData;
  error?: string;
} {
  const result = collectionConfigSchema.safeParse(config);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    error: result.error.issues[0].message,
  };
}
