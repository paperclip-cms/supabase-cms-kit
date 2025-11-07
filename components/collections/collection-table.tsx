"use client";

import { Tables } from "@/lib/supabase/types";
import { CollectionTableRow } from "./collection-table-row";

interface CollectionTableProps {
  items: Tables<"items">[];
}

export function CollectionTable({ items }: CollectionTableProps) {
  return (
    <div className="w-full border border-border rounded-lg overflow-hidden">
      <div className="bg-secondary/50 dark:bg-muted/50 px-6 py-1.5 text-xs uppercase tracking-wide flex items-center text-muted-foreground/70 border-b sticky top-0 z-10">
        <div className="md:hidden w-full">Title</div>
        <div className="hidden md:contents">
          <div className="w-[45%] xl:w-[50%]">Title</div>
          <div className="w-[20%] xl:w-[15%] pl-2">Status</div>
          <div className="hidden xl:block xl:w-[17.5%] pl-2">Created</div>
          <div className="w-[35%] xl:w-[17.5%] pl-2">Updated</div>
        </div>
      </div>

      <div className="w-full">
        {items.map((item) => (
          <CollectionTableRow key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
