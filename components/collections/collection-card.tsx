"use client";

import Link from "next/link";
import { Collection } from "@/lib/mock-data";
import { formatDistanceToNow } from "date-fns";
import * as Icons from "lucide-react";

interface CollectionCardProps {
  collection: Collection;
}

export function CollectionCard({ collection }: CollectionCardProps) {
  const timeAgo = formatDistanceToNow(collection.lastUpdated, {
    addSuffix: true,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Icon = (Icons as any)[collection.icon] || Icons.FolderIcon;

  return (
    <Link href={`/collections/${collection.id}`} className="block">
      <div className="w-full h-full min-h-[200px] p-4 bg-background rounded-md border border-gray-300 dark:border-border/50 hover:border-gray-500 dark:hover:border-border cursor-pointer transition-colors duration-200 group flex flex-col">
        <div className="mb-3">
          <div className="size-10 rounded-md bg-muted/50 flex items-center justify-center">
            <Icon className="size-5 text-muted-foreground" />
          </div>
        </div>

        <h3 className="text-base font-semibold mb-3 group-hover:text-primary transition-colors">
          {collection.name}
        </h3>

        <div className="space-y-1 text-sm text-muted-foreground mb-3 flex-1">
          <div>
            {collection.entryCount}{" "}
            {collection.entryCount === 1 ? "entry" : "entries"}
          </div>
          {collection.draftCount > 0 ? (
            <div>
              {collection.draftCount}{" "}
              {collection.draftCount === 1 ? "draft" : "drafts"}
            </div>
          ) : (
            <div className="text-transparent select-none">All published</div>
          )}
        </div>

        <div className="text-xs text-muted-foreground">Updated {timeAgo}</div>
      </div>
    </Link>
  );
}
