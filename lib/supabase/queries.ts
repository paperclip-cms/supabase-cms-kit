import { QueryData } from "@supabase/supabase-js";
import type { Database } from "./types";
import type { SupabaseClient } from "@supabase/supabase-js";

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

export function getCollectionWithItemsQuery(
  supabase: SupabaseClient<Database>,
  collectionSlug: string,
) {
  return supabase
    .from("collections")
    .select("*, items(*)")
    .eq("slug", collectionSlug)
    .single();
}

export type CollectionWithItems = QueryData<
  ReturnType<typeof getCollectionWithItemsQuery>
>;
