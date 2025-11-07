"use client";

import { CollectionCard } from "@/components/collections/collection-card";
import { NewCollectionModal } from "@/components/collections/new-collection-modal";
import { CollectionsEmptyState } from "@/components/collections/empty-state";
import type { CollectionsWithItemMetadata } from "@/lib/supabase/queries";

interface CollectionsListProps {
  collections: CollectionsWithItemMetadata;
}

export function CollectionsList({ collections }: CollectionsListProps) {
  if (collections.length === 0) {
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
