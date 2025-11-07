import { CollectionTable } from "@/components/collections/collection-table";
import { CollectionItemsEmptyState } from "@/components/collections/collection-items-empty-state";
import { Button } from "@/components/ui/button";
import { PlusIcon, ArrowLeftIcon, SettingsIcon } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ collectionSlug: string }>;
}) {
  const { collectionSlug } = await params;

  const supabase = await createClient();

  const { data: collection, error } = await supabase
    .from("collections")
    .select("*, items(*)")
    .eq("slug", collectionSlug)
    .single();

  if (error) {
    console.error(error);
    return <div>Error loading collection</div>;
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col mb-8 gap-2">
        {/* Mobile: Small breadcrumb above back button */}
        <div className="md:hidden flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link
            href="/collections"
            className="hover:text-foreground transition-colors"
          >
            Collections
          </Link>
          <span>/</span>
          <span className="text-foreground">{collection.label}</span>
        </div>

        <div className="flex items-center justify-between gap-4">
          {/* Title with back button */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Mobile: Just back arrow */}
            <Link href="/collections" className="md:hidden shrink-0">
              <ArrowLeftIcon className="size-6" />
            </Link>

            {/* Desktop: Breadcrumb */}
            <Link
              href="/collections"
              className="hidden md:block text-3xl font-bold font-heading text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              Collections
            </Link>
            <span className="hidden md:block text-3xl font-bold font-heading text-muted-foreground shrink-0">
              /
            </span>
            <h1 className="text-3xl font-bold font-heading truncate">
              {collection.label}
            </h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button asChild variant="secondary">
              <Link
                href={`/collections/${collectionSlug}/new`}
                className="flex items-center gap-2"
              >
                <PlusIcon className="size-4" />
                <span className="hidden md:inline">New Item</span>
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link
                href={`/collections/${collectionSlug}/edit`}
                className="flex items-center gap-2"
              >
                <SettingsIcon className="size-4" />
                <span className="hidden md:inline">Edit Collection</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Table or Empty State */}
      {collection.items && collection.items.length > 0 ? (
        <CollectionTable items={collection.items} />
      ) : (
        <CollectionItemsEmptyState
          collectionSlug={collectionSlug}
          collectionLabel={collection.label}
        />
      )}
    </div>
  );
}
