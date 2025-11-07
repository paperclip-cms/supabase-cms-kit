"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IconPicker } from "@/components/ui/icon-picker";
import type dynamicIconImports from "lucide-react/dynamicIconImports";

type IconName = keyof typeof dynamicIconImports;
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CollectionFormData, collectionSchema } from "@/lib/schemas";

// type ValidationErrors = Partial<Record<keyof CollectionFormData, string>>;

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters except spaces and hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, "") // Remove leading/trailing hyphens
    .trim();
}

export function NewCollectionModal() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [icon, setIcon] = React.useState<IconName>("zap");
  const [error, setError] = React.useState<string | null>("");
  const [touched, setTouched] = React.useState<
    Partial<Record<keyof CollectionFormData, boolean>>
  >({});
  const [loading, setLoading] = React.useState<boolean>(false);

  // Auto-generate slug from title
  const slug = React.useMemo(() => slugify(title), [title]);

  // Validate form whenever values change
  React.useEffect(() => {
    try {
      const result = collectionSchema.safeParse({ title, slug, icon });
      if (result.success) {
        setError(null);
      } else if (result.error) {
        setError(result.error!.issues[0].message);
      }
    } catch (err) {
      console.error("Validation error:", err);
    }
  }, [title, slug, icon]);

  const handleSubmit = async (e: React.FormEvent) => {
    setLoading(true);

    e.preventDefault();
    setTouched({ title: true, slug: true, icon: true });

    const result = collectionSchema.safeParse({ title, slug, icon });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    const supabase = createClient();

    const { data: newCollection, error } = await supabase
      .from("collections")
      .insert({
        label: title,
        slug,
        icon,
        config: { test: "config" },
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      setError("Failed to create collection. Please try again.");
      setLoading(false);
      return;
    }

    router.push(`/collections/${newCollection.slug}`);
  };

  const isValid = !error && title && slug && icon;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">
          <PlusIcon className="size-4" />
          New Collection
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create new collection</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title
              </label>
              <div className="flex items-center gap-2">
                <IconPicker value={icon} onChange={setIcon} />
                <input
                  id="title"
                  type="text"
                  value={title}
                  onInput={(e) => setTitle(e.currentTarget.value)}
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, title: true }))
                  }
                  placeholder="e.g., Blog Posts"
                  className="flex-1 px-3 py-2 text-sm border rounded-md outline-none focus:ring-2 focus:ring-ring"
                  autoFocus
                />
              </div>
              {touched.title && error && (
                <p className="text-xs text-destructive">{error}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="slug" className="text-sm font-medium">
                Slug
              </label>
              <input
                id="slug"
                type="text"
                value={slug}
                disabled
                placeholder="e.g., blog-posts"
                className="w-full px-3 py-2 text-sm border rounded-md outline-none focus:ring-2 focus:ring-ring font-mono bg-muted text-muted-foreground cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">
                Used for API calls
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid || loading}>
              {loading ? "Loading..." : "Create collection"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
