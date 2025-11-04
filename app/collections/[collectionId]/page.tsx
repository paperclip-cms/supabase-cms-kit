import { collections, collectionEntries } from "@/lib/mock-data";
import { notFound } from "next/navigation";
import { CollectionTable } from "@/components/collections/collection-table";
import { Button } from "@/components/ui/button";
import { PlusIcon, ArrowLeftIcon, SettingsIcon } from "lucide-react";
import Link from "next/link";

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ collectionId: string }>;
}) {
  const { collectionId } = await params;
  const collection = collections.find((c) => c.id === collectionId);

  if (!collection) {
    notFound();
  }

  const entries = collectionEntries[collectionId] || [];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 gap-4">
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
            {collection.name}
          </h1>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button asChild variant="secondary">
            <Link
              href={`/collections/${collectionId}/new`}
              className="flex items-center gap-2"
            >
              <PlusIcon className="size-4" />
              <span className="hidden md:inline">New Entry</span>
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link
              href={`/collections/${collectionId}/edit`}
              className="flex items-center gap-2"
            >
              <SettingsIcon className="size-4" />
              <span className="hidden md:inline">Edit Collection</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Table */}
      <CollectionTable entries={entries} />
    </div>
  );
}
