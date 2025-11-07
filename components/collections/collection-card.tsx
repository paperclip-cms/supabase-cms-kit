"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { DynamicIcon, IconName } from "lucide-react/dynamic";

interface CollectionCardProps {
  collection: {
    id: string;
    slug: string;
    label: string;
    icon: string;
    updated_at: string;
    items: {
      id: string;
      published_at?: string;
    }[];
  };
}

export function CollectionCard({ collection }: CollectionCardProps) {
  const timeAgo = formatDistanceToNow(collection.updated_at, {
    addSuffix: true,
  });

  const icon = collection.icon ?? "folder";

  const publishedCount = collection.items.filter(
    (item) => item.published_at,
  ).length;
  const draftCount = collection.items.filter(
    (item) => !item.published_at,
  ).length;

  return (
    <Link href={`/collections/${collection.slug}`} className="block">
      <div className="w-full h-full min-h-[200px] p-4 bg-background rounded-md border border-gray-300 dark:border-border/50 hover:border-gray-500 dark:hover:border-border cursor-pointer transition-colors duration-200 group flex flex-col">
        <div className="mb-3">
          <div className="size-10 rounded-md bg-muted/50 flex items-center justify-center">
            <DynamicIcon
              name={icon as IconName}
              className="size-5 text-muted-foreground"
            />
          </div>
        </div>

        <h3 className="text-base font-semibold mb-3 group-hover:text-primary transition-colors">
          {collection.label}
        </h3>

        <div className="space-y-1 text-sm text-muted-foreground mb-3 flex-1">
          <div>
            {publishedCount} {publishedCount === 1 ? "entry" : "entries"}
          </div>
          {draftCount > 0 && (
            <div>
              {draftCount} {draftCount === 1 ? "draft" : "drafts"}
            </div>
          )}
        </div>

        <div className="text-xs text-muted-foreground">Updated {timeAgo}</div>
      </div>
    </Link>
  );
}
