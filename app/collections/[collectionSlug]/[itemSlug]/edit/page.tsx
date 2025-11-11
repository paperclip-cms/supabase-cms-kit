import { createClient } from "@/lib/supabase/server";
import { getItemWithCollectionQuery } from "@/lib/supabase/queries";
import { ItemEditor } from "@/components/items/item-editor";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { CollectionConfig } from "@/lib/types";
import { notFound } from "next/navigation";

export default async function EditItemPage({
  params,
}: {
  params: Promise<{ collectionSlug: string; itemSlug: string }>;
}) {
  const { collectionSlug, itemSlug } = await params;

  const supabase = await createClient();

  // Fetch the item with collection data
  const { data: item, error } = await getItemWithCollectionQuery(
    supabase,
    collectionSlug,
    itemSlug,
  );

  if (error || !item) {
    console.error(error);
    notFound();
  }

  // Parse the collection config
  const collectionConfig = item.collection?.config as CollectionConfig;
  const collectionLabel = item.collection?.label || "Collection";

  return (
    <div className="w-full flex justify-center p-8">
      <div className="w-full max-w-7xl">
        <Breadcrumb
          items={[
            { label: "Collections", href: "/collections" },
            { label: collectionLabel, href: `/collections/${collectionSlug}` },
            {
              label: item.title,
              href: `/collections/${collectionSlug}/${itemSlug}`,
            },
          ]}
          currentPage="Edit"
          className="mb-8"
        />

        {/* Item Editor with existing data */}
        <ItemEditor
          collectionSlug={collectionSlug}
          collectionLabel={collectionLabel}
          collectionConfig={collectionConfig}
          initialData={item}
        />
      </div>
    </div>
  );
}
