"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { itemSchema } from "@/lib/schemas";
import { z } from "zod";
import { CollectionConfig, FieldConfig, FieldType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "./rich-text-editor";
import { FieldInput } from "./field-inputs";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2Icon, SaveIcon } from "lucide-react";
import { BUILT_IN_FIELDS } from "@/lib/field-options";

interface ItemEditorProps {
  collectionSlug: string;
  collectionLabel: string;
  collectionConfig: CollectionConfig;
}

export function ItemEditor({
  collectionSlug,
  collectionLabel,
  collectionConfig,
}: ItemEditorProps) {
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  type ItemFormInput = z.input<typeof itemSchema>;

  const form = useForm<ItemFormInput>({
    resolver: zodResolver(itemSchema) as any,
    mode: "onChange",
    defaultValues: {
      slug: "",
      title: "",
      content: "",
      author: "",
      date: "",
      tags: [],
      cover: "",
      published: false,
      item_data: {},
    },
  });

  const handleSave = form.handleSubmit(async (data) => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/collections/${collectionSlug}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create item");
      }

      const result = await response.json();
      router.push(`/collections/${collectionSlug}/${result.slug}`);
    } catch (error) {
      console.error("Error saving item:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to save item. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  });

  // Get built-in field settings
  const builtInFieldSettings = collectionConfig.builtInFields || {};

  // Check which built-in fields are visible
  const isTitleVisible = builtInFieldSettings.title?.visible !== false; // Default true
  const isAuthorVisible = builtInFieldSettings.author?.visible === true;
  const isContentVisible = builtInFieldSettings.content?.visible !== false; // Default true - always show unless explicitly hidden
  const isDateVisible = builtInFieldSettings.date?.visible === true;
  const isTagsVisible = builtInFieldSettings.tags?.visible === true;
  const isCoverVisible = builtInFieldSettings.cover?.visible === true;

  // Get custom fields
  const customFields = collectionConfig.customFields || [];

  // Separate rich text fields from other custom fields
  const richTextFields = customFields.filter(
    (f) => f.type === FieldType.RichText
  );
  const nonRichTextFields = customFields.filter(
    (f) => f.type !== FieldType.RichText
  );

  // Generate slug from title
  const watchTitle = form.watch("title");
  const handleGenerateSlug = () => {
    const slug = watchTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    form.setValue("slug", slug);
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSave} className="w-full max-w-4xl mx-auto">
        {/* Notion-style layout */}
        <div className="space-y-6">
          {/* Title Section - Always at the top, Notion-style */}
          {isTitleVisible && (
            <div>
              <Input
                {...form.register("title")}
                placeholder={`${collectionLabel} title...`}
                className="text-4xl font-bold border-none px-0 py-2 focus-visible:ring-0 placeholder:text-muted-foreground/40"
              />
              {form.formState.errors.title && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>
          )}

          {/* Metadata Section - Fields at the top */}
          <div className="space-y-6 pb-6 border-b">
            {/* Slug */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Slug
              </label>
              <div className="flex gap-2">
                <Input
                  {...form.register("slug")}
                  placeholder="item-slug"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGenerateSlug}
                  disabled={!watchTitle}
                >
                  Generate
                </Button>
              </div>
              {form.formState.errors.slug && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.slug.message}
                </p>
              )}
            </div>

            {/* Built-in Fields */}
            {isAuthorVisible && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Author
                </label>
                <Input
                  {...form.register("author")}
                  placeholder="Author name"
                  className="mt-2"
                />
              </div>
            )}

            {isDateVisible && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Date
                </label>
                <Input
                  {...form.register("date")}
                  type="date"
                  className="mt-2"
                />
              </div>
            )}

            {isCoverVisible && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Cover Image
                </label>
                <Input
                  {...form.register("cover")}
                  placeholder="https://example.com/image.jpg"
                  className="mt-2"
                />
                {form.watch("cover") && (
                  <div className="mt-2">
                    <img
                      src={form.watch("cover")}
                      alt="Cover"
                      className="max-w-xs rounded-lg border"
                    />
                  </div>
                )}
              </div>
            )}

            {isTagsVisible && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Tags
                </label>
                <Input
                  placeholder="tag1, tag2, tag3"
                  onChange={(e) => {
                    const tags = e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean);
                    form.setValue("tags", tags);
                  }}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Separate tags with commas
                </p>
              </div>
            )}

            {/* Non-RichText Custom Fields */}
            {nonRichTextFields.map((field) => (
              <div key={field.slug}>
                <FieldInput
                  field={field}
                  value={form.watch(`item_data.${field.slug}` as any)}
                  onChange={(value) =>
                    form.setValue(`item_data.${field.slug}` as any, value)
                  }
                  error={
                    form.formState.errors.item_data?.[field.slug]?.message
                  }
                />
              </div>
            ))}
          </div>

          {/* Content Section - Notion-style, main content area */}
          {isContentVisible && (
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-2">
                Content
              </label>
              <RichTextEditor
                content={form.watch("content") || ""}
                onChange={(content) => form.setValue("content", content)}
                placeholder="Start writing your content..."
              />
              {form.formState.errors.content && (
                <p className="text-sm text-destructive mt-2">
                  {form.formState.errors.content.message}
                </p>
              )}
            </div>
          )}

          {/* Additional Rich Text Fields */}
          {richTextFields.map((field) => (
            <div key={field.slug}>
              <FieldInput
                field={field}
                value={form.watch(`item_data.${field.slug}` as any)}
                onChange={(value) =>
                  form.setValue(`item_data.${field.slug}` as any, value)
                }
                error={form.formState.errors.item_data?.[field.slug]?.message}
              />
            </div>
          ))}

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t sticky bottom-0 bg-background pb-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.setValue("published", false);
                  handleSave();
                }}
                disabled={isSaving}
              >
                Save as Draft
              </Button>
              <Button
                type="button"
                onClick={() => {
                  form.setValue("published", true);
                  handleSave();
                }}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2Icon className="size-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <SaveIcon className="size-4 mr-2" />
                    Publish
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
