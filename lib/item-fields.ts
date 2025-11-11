import { BUILT_IN_FIELDS, BuiltInField } from "./field-options";
import { CollectionConfig } from "./types";

/**
 * Check if a built-in field is visible based on collection config.
 *
 * Default visibility behavior:
 * - Core fields (title, slug): always visible
 * - Optional fields (content, author, etc.): visible by default, can be hidden
 */
export function isFieldVisible(
  field: BuiltInField,
  config: CollectionConfig,
): boolean {
  const settings = config.builtInFields?.[field.slug];

  // All built-in fields default to visible unless explicitly hidden
  return settings?.visible !== false;
}

/**
 * Get built-in fields filtered by visibility, excluding specified fields.
 */
export function getVisibleFields(
  config: CollectionConfig,
  exclude: string[] = [],
): BuiltInField[] {
  return BUILT_IN_FIELDS.filter(
    (field) => !exclude.includes(field.slug) && isFieldVisible(field, config),
  );
}

/**
 * Get built-in fields that are hidden but available, excluding specified fields.
 */
export function getHiddenFields(
  config: CollectionConfig,
  exclude: string[] = [],
): BuiltInField[] {
  return BUILT_IN_FIELDS.filter(
    (field) => !exclude.includes(field.slug) && !isFieldVisible(field, config),
  );
}
