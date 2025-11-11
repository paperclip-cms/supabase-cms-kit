import { createClient } from "@/lib/supabase/server";
import { ItemEditor } from "@/components/items/item-editor";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { CollectionConfig } from "@/lib/types";

export default async function NewItemPage({
  params,
}: {
  params: Promise<{ collectionSlug: string }>;
}) {
  const { collectionSlug } = await params;

  const supabase = await createClient();
  const { data: collection, error } = await supabase
    .from("collections")
    .select("label, config")
    .eq("slug", collectionSlug)
    .single();

  if (error) {
    console.error(error);
    return <div>Error loading collection</div>;
  }

  const collectionConfig = collection.config as CollectionConfig;

  return (
    <div className="w-full flex justify-center p-8">
      <div className="w-full max-w-7xl">
        <Breadcrumb
          items={[
            { label: "Collections", href: "/collections" },
            { label: collection.label, href: `/collections/${collectionSlug}` },
          ]}
          currentPage="New Item"
          className="mb-8"
        />

        {/* Item Editor */}
        <ItemEditor
          collectionSlug={collectionSlug}
          collectionLabel={collection.label}
          collectionConfig={collectionConfig}
        />
      </div>
    </div>
  );
}
