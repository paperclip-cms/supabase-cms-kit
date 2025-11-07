import z from "zod";

// TODO: infer from supabase schema?
export const collectionSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be 100 characters or less"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100, "Slug must be 100 characters or less")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain only lowercase letters, numbers, and hyphens (no spaces or special characters)",
    ),
  icon: z.string().min(1, "Icon is required"),
});

export type CollectionFormData = z.infer<typeof collectionSchema>;
