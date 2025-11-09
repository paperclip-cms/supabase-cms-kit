import { z } from "zod";
import {
  fieldConfigSchema,
  builtInFieldSettingsSchema,
} from "./field-validation";

export const collectionEditFormSchema = z.object({
  label: z.string().min(1, "Collection name is required"),
  icon: z.string(),
  builtInFields: z.record(z.string(), builtInFieldSettingsSchema).optional(),
  customFields: z.array(fieldConfigSchema).optional(),
});

export type CollectionEditFormData = z.infer<typeof collectionEditFormSchema>;
