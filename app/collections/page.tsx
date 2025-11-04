import { collections } from "@/lib/mock-data";
import { CollectionCard } from "@/components/collections/collection-card";
import { CollectionsEmptyState } from "@/components/collections/empty-state";
import { NewCollectionModal } from "@/components/collections/new-collection-modal";

export default function CollectionsPage() {
  const hasCollections = collections.length > 0;

  if (!hasCollections) {
    return <CollectionsEmptyState />;
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Collections</h1>
        <NewCollectionModal />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {collections.map((collection) => (
          <CollectionCard key={collection.id} collection={collection} />
        ))}
      </div>
    </div>
  );
}
