import { createClient } from "@/lib/supabase/server";
import { getItemWithCollectionQuery } from "@/lib/supabase/queries";
import { ItemView } from "@/components/items/item-view";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, PencilIcon } from "lucide-react";
import Link from "next/link";
import { CollectionConfig } from "@/lib/types";
import { notFound } from "next/navigation";

export default async function ItemPage({
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
        {/* Header with breadcrumbs and actions */}
        <div className="flex flex-col mb-8 gap-4">
          {/* Mobile: Small breadcrumb */}
          <div className="md:hidden flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link
              href="/collections"
              className="hover:text-foreground transition-colors"
            >
              Collections
            </Link>
            <span>/</span>
            <Link
              href={`/collections/${collectionSlug}`}
              className="hover:text-foreground transition-colors"
            >
              {collectionLabel}
            </Link>
            <span>/</span>
            <span className="text-foreground">{item.title}</span>
          </div>

          {/* Desktop breadcrumb and actions */}
          <div className="flex items-center justify-between gap-4">
            {/* Breadcrumb */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {/* Mobile: Just back arrow */}
              <Link
                href={`/collections/${collectionSlug}`}
                className="md:hidden shrink-0"
              >
                <ArrowLeftIcon className="size-6" />
              </Link>

              {/* Desktop: Full breadcrumb */}
              <Link
                href="/collections"
                className="hidden md:block text-2xl font-bold font-heading text-muted-foreground hover:text-foreground transition-colors shrink-0"
              >
                Collections
              </Link>
              <span className="hidden md:block text-2xl font-bold font-heading text-muted-foreground shrink-0">
                /
              </span>
              <Link
                href={`/collections/${collectionSlug}`}
                className="hidden md:block text-2xl font-bold font-heading text-muted-foreground hover:text-foreground transition-colors truncate"
              >
                {collectionLabel}
              </Link>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <Button asChild variant="secondary">
                <Link
                  href={`/collections/${collectionSlug}/${itemSlug}/edit`}
                  className="flex items-center gap-2"
                >
                  <PencilIcon className="size-4" />
                  <span className="hidden md:inline">Edit</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Item content */}
        <ItemView item={item} collectionConfig={collectionConfig} />
      </div>
    </div>
  );
}
