import { FileTextIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import Link from "next/link";

interface CollectionItemsEmptyStateProps {
  collectionSlug: string;
  collectionLabel: string;
}

export function CollectionItemsEmptyState({
  collectionSlug,
  collectionLabel,
}: CollectionItemsEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
      <div className="size-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
        <FileTextIcon className="size-8 text-muted-foreground" />
      </div>
      <h2 className="text-2xl font-semibold mb-2">No items yet</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        Get started by creating your first item in{" "}
        <span className="font-medium text-foreground">{collectionLabel}</span>
      </p>
      <Button asChild>
        <Link
          href={`/collections/${collectionSlug}/new`}
          className="flex items-center gap-2"
        >
          <PlusIcon className="size-4" />
          <span>Create First Item</span>
        </Link>
      </Button>
    </div>
  );
}
