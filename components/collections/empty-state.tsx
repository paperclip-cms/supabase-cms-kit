import { Button } from "@/components/ui/button";
import { FolderOpenIcon } from "lucide-react";
import Link from "next/link";

export function CollectionsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
      <div className="size-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
        <FolderOpenIcon className="size-8 text-muted-foreground" />
      </div>
      <h2 className="text-2xl font-semibold mb-2">No collections yet</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        Get started by creating your first collection to organize your content
      </p>
      <Button asChild>
        <Link href="/collections/new">Create Collection</Link>
      </Button>
    </div>
  );
}
