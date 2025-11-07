import { CollectionCard } from "@/components/collections/collection-card";
import { CollectionsEmptyState } from "@/components/collections/empty-state";
import { NewCollectionModal } from "@/components/collections/new-collection-modal";
import { createClient } from "@/lib/supabase/server";
import {
  getCollectionsQuery,
  type CollectionsWithItemMetadata,
} from "@/lib/supabase/queries";

export default async function CollectionsPage() {
  const supabase = await createClient();

  const { data, error } = await getCollectionsQuery(supabase);

  if (error) {
    console.error(error);
    return <div>Error loading collections</div>;
  }

  const collections: CollectionsWithItemMetadata = data;

  if (collections.length == 0) {
    return <CollectionsEmptyState />;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Collections</h1>
        <NewCollectionModal />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {collections.map((collection) => (
          <CollectionCard key={collection.id} collection={collection} />
        ))}
      </div>
    </div>
  );
}
