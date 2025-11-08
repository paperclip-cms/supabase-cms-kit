import z from "zod";

// TODO: infer from supabase schema?

/**
 * Slug validators
 *
 * Collections/Items use kebab-case (for URLs): "van-log", "my-item"
 * Fields use snake_case (for object properties): "author_name", "published_at"
 */

// Collection/Item slugs - kebab-case for URLs
export const slugSchema = z
  .string()
  .min(1, "Slug is required")
  .max(100, "Slug must be 100 characters or less")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug must contain only lowercase letters, numbers, and hyphens",
  );

// Field slugs - snake_case for object properties
export const fieldSlugSchema = z
  .string()
  .min(1, "Field slug is required")
  .max(50, "Field slug must be 50 characters or less")
  .regex(
    /^[a-z_][a-z0-9_]*$/,
    "Field slug must start with a letter or underscore and contain only lowercase letters, numbers, and underscores",
  );

/**
 * Collection metadata validation
 */
export const collectionSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be 100 characters or less"),
  slug: slugSchema,
  icon: z.string().min(1, "Icon is required"),
});

export type CollectionFormData = z.infer<typeof collectionSchema>;
