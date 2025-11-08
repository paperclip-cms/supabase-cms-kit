"use server";

import { createClient } from "@/lib/supabase/server";
import { CollectionConfig } from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function updateCollectionConfig(
  collectionSlug: string,
  config: CollectionConfig,
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("collections")
    .update({ config })
    .eq("slug", collectionSlug);

  if (error) {
    return { success: false, error: error.message };
  }

  // TODO: do we need this?
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

  // TODO: do we need this?
  revalidatePath(`/collections/${collectionSlug}/edit`);
  revalidatePath(`/collections/${collectionSlug}`);

  return { success: true };
}
