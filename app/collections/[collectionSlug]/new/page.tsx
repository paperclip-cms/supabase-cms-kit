import { createClient } from "@/lib/supabase/server";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

export default async function NewItemPage({
  params,
}: {
  params: Promise<{ collectionSlug: string }>;
}) {
  const { collectionSlug } = await params;

  const supabase = await createClient();
  const { data: collection, error } = await supabase
    .from("collections")
    .select("label")
    .eq("slug", collectionSlug)
    .single();

  if (error) {
    console.error(error);
    return <div>Error loading collection</div>;
  }

  const collectionName = collection.label;

  return (
    <div className="p-8">
      <div className="flex flex-col mb-8 gap-2">
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
            {collectionName}
          </Link>
          <span>/</span>
          <span className="text-foreground">New Item</span>
        </div>

        <div className="flex items-center justify-between gap-4">
          {/* Title with back button */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Mobile: Just back arrow */}
            <Link
              href={`/collections/${collectionSlug}`}
              className="md:hidden shrink-0"
            >
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
            <Link
              href={`/collections/${collectionSlug}`}
              className="hidden md:block text-3xl font-bold font-heading text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              {collectionName}
            </Link>
            <span className="hidden md:block text-3xl font-bold font-heading text-muted-foreground shrink-0">
              /
            </span>
            <h1 className="text-3xl font-bold font-heading truncate">
              New Item
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
}
