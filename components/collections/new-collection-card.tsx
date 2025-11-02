'use client';

import Link from 'next/link';
import { PlusIcon } from 'lucide-react';

export function NewCollectionCard() {
  return (
    <Link href="/collections/new" className="block">
      <div className="w-full h-full min-h-[200px] p-4 bg-background rounded-md border-2 border-dashed border-gray-300 dark:border-border/50 cursor-pointer hover:border-gray-500 dark:hover:border-border transition-colors duration-200 flex flex-col items-center justify-center gap-3">
        <div className="size-12 rounded-full bg-muted/50 flex items-center justify-center">
          <PlusIcon className="size-6 text-muted-foreground" />
        </div>
        <div className="text-center">
          <h3 className="text-base font-semibold mb-1">
            New Collection
          </h3>
          <p className="text-sm text-muted-foreground">Create a new content model</p>
        </div>
      </div>
    </Link>
  );
}
