"use server";

import { createClient } from "@/lib/supabase/server";
import { CollectionConfig } from "@/lib/types";
import { collectionConfigSchema } from "@/lib/field-validation";
import { revalidatePath } from "next/cache";

export async function updateCollectionConfig(
  collectionSlug: string,
  config: CollectionConfig,
) {
  // Validate config before saving to database
  const validationResult = collectionConfigSchema.safeParse(config);

  if (!validationResult.success) {
    return {
      success: false,
      error: validationResult.error.issues[0].message,
    };
  }

  const supabase = await createClient();

  // Cast validated data for JSONB storage (Supabase Json type is restrictive)
  const { error } = await supabase
    .from("collections")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .update({ config: validationResult.data as any })
    .eq("slug", collectionSlug);

  if (error) {
    return { success: false, error: error.message };
  }

  // TODO: why do we need this?
  revalidatePath(`/collections/${collectionSlug}/edit`);
  revalidatePath(`/collections/${collectionSlug}`);

  return { success: true };
}

export async function updateCollectionMetadata(
  collectionSlug: string,
  data: { label?: string; icon?: string },
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("collections")
    .update(data)
    .eq("slug", collectionSlug);

  if (error) {
    return { success: false, error: error.message };
  }

  // TODO: why do we need this?
  revalidatePath(`/collections/${collectionSlug}/edit`);
  revalidatePath(`/collections/${collectionSlug}`);

  return { success: true };
}
