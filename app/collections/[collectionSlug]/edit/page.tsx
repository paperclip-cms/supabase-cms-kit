import { createClient } from "@/lib/supabase/server";
import { CollectionEditClient } from "./client";
import { notFound } from "next/navigation";

export default async function CollectionEditPage({
  params,
}: {
  params: Promise<{ collectionSlug: string }>;
}) {
  const { collectionSlug } = await params;

  const supabase = await createClient();
  const { data: collection, error } = await supabase
    .from("collections")
    .select("*")
    .eq("slug", collectionSlug)
    .single();

  if (error || !collection) {
    notFound();
  }

  return <CollectionEditClient collection={collection} />;
}
