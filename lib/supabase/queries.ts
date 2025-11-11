import { QueryData } from "@supabase/supabase-js";
import type { Database } from "./types";
import type { SupabaseClient } from "@supabase/supabase-js";

// If anyone knows a better way to manage Supabase query types, let me know...

export function getCollectionsQuery(supabase: SupabaseClient<Database>) {
  return supabase
    .from("collections")
    .select(
      `
      id,
      slug,
      label,
      icon,
      updated_at,
      items (
        id,
        published_at
      )
    `,
    )
    .order("created_at", { ascending: false });
}

export type CollectionsWithItemMetadata = QueryData<
  ReturnType<typeof getCollectionsQuery>
>;

export function getItemWithCollectionQuery(
  supabase: SupabaseClient<Database>,
  collectionSlug: string,
  itemSlug: string,
) {
  return supabase
    .from("items")
    .select(
      `
      id,
      slug,
      title,
      content,
      author,
      date,
      tags,
      cover,
      published_at,
      created_at,
      updated_at,
      item_data,
      collection:collections (
        id,
        slug,
        label,
        icon,
        config
      )
    `,
    )
    .eq("slug", itemSlug)
    .eq("collections.slug", collectionSlug)
    .single();
}

export type ItemWithCollection = QueryData<
  ReturnType<typeof getItemWithCollectionQuery>
>;
