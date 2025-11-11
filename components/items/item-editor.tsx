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
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader2Icon, SaveIcon } from "lucide-react";
import { BUILT_IN_FIELDS } from "@/lib/field-options";
import { slugify } from "@/lib/utils";

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
  const [showAllProperties, setShowAllProperties] = useState(false);
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
    // Validate required custom fields
    const errors: string[] = [];
    if (data.item_data) {
      customFields.forEach((field) => {
        if (field.required) {
          const value = data.item_data?.[field.slug];
          if (value === undefined || value === null || value === "") {
            errors.push(`${field.label} is required`);
          }
        }
      });
    }

    if (errors.length > 0) {
      alert(`Please fill in required fields:\n${errors.join("\n")}`);
      return;
    }

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

  // Auto-generate slug from title (using useMemo like collection modal)
  const watchTitle = form.watch("title");
  const autoSlug = useMemo(() => slugify(watchTitle), [watchTitle]);

  useEffect(() => {
    // Always sync auto-generated slug unless user has manually edited it
    if (autoSlug && !form.formState.dirtyFields.slug) {
      form.setValue("slug", autoSlug, { shouldValidate: false });
    }
  }, [autoSlug, form]);

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSave} className="w-full max-w-4xl mx-auto">
        {/* Notion-style layout */}
        <div className="space-y-8">
          {/* Title Section - Always at the top, Notion-style */}
          {isTitleVisible && (
            <div>
              <Input
                {...form.register("title")}
                placeholder={`${collectionLabel} title...`}
                className="text-5xl font-bold border-none shadow-none px-0 py-3 h-auto focus-visible:ring-0 placeholder:text-muted-foreground/30"
              />
              {form.formState.errors.title && (
                <p className="text-sm text-destructive mt-2">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>
          )}

          {/* Metadata Section - Compact properties */}
          <div className="space-y-4">
            {/* Slug */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-muted-foreground min-w-[80px]">
                Slug
              </label>
              <div className="flex-1 max-w-md">
                <Input
                  {...form.register("slug")}
                  placeholder="auto-generated-slug"
                  className="text-sm"
                />
                {form.formState.errors.slug && (
                  <p className="text-xs text-destructive mt-1">
                    {form.formState.errors.slug.message}
                  </p>
                )}
              </div>
            </div>

            {/* Built-in Fields */}
            {isAuthorVisible && (
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-muted-foreground min-w-[80px]">
                  Author
                </label>
                <div className="flex-1 max-w-md">
                  <Input
                    {...form.register("author")}
                    placeholder="Author name"
                    className="text-sm"
                  />
                </div>
              </div>
            )}

            {isDateVisible && (
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-muted-foreground min-w-[80px]">
                  Date
                </label>
                <div className="flex-1 max-w-xs">
                  <Input
                    {...form.register("date")}
                    type="date"
                    className="text-sm"
                  />
                </div>
              </div>
            )}

            {isCoverVisible && (
              <div className="flex items-start gap-4">
                <label className="text-sm font-medium text-muted-foreground min-w-[80px] pt-2">
                  Cover
                </label>
                <div className="flex-1 max-w-md space-y-2">
                  <Input
                    {...form.register("cover")}
                    placeholder="https://example.com/image.jpg"
                    className="text-sm"
                  />
                  {form.watch("cover") && (
                    <img
                      src={form.watch("cover")}
                      alt="Cover"
                      className="max-w-xs rounded-lg border"
                    />
                  )}
                </div>
              </div>
            )}

            {isTagsVisible && (
              <div className="flex items-start gap-4">
                <label className="text-sm font-medium text-muted-foreground min-w-[80px] pt-2">
                  Tags
                </label>
                <div className="flex-1 max-w-md">
                  <Input
                    placeholder="tag1, tag2, tag3"
                    onChange={(e) => {
                      const tags = e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean);
                      form.setValue("tags", tags);
                    }}
                    className="text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Separate with commas
                  </p>
                </div>
              </div>
            )}

            {/* Custom Fields - render inline like built-in fields */}
            {nonRichTextFields.map((field) => (
              <div key={field.slug} className="flex items-start gap-4">
                <label className="text-sm font-medium text-muted-foreground min-w-[80px] pt-2">
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </label>
                <div className="flex-1 max-w-md">
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
              </div>
            ))}

            {/* Hidden Properties Toggle */}
            {(!isAuthorVisible || !isDateVisible || !isCoverVisible || !isTagsVisible) && (
              <div className="flex items-center gap-4">
                <div className="min-w-[80px]" />
                <button
                  type="button"
                  onClick={() => setShowAllProperties(!showAllProperties)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  {showAllProperties ? "− Hide" : "+ Show"} hidden properties
                </button>
              </div>
            )}

            {/* Hidden Built-in Fields */}
            {showAllProperties && (
              <>
                {!isAuthorVisible && (
                  <div className="flex items-center gap-4 opacity-60 hover:opacity-100 transition-opacity">
                    <label className="text-sm font-medium text-muted-foreground min-w-[80px]">
                      Author
                    </label>
                    <div className="flex-1 max-w-md">
                      <Input
                        {...form.register("author")}
                        placeholder="Author name"
                        className="text-sm"
                      />
                    </div>
                  </div>
                )}

                {!isDateVisible && (
                  <div className="flex items-center gap-4 opacity-60 hover:opacity-100 transition-opacity">
                    <label className="text-sm font-medium text-muted-foreground min-w-[80px]">
                      Date
                    </label>
                    <div className="flex-1 max-w-xs">
                      <Input
                        {...form.register("date")}
                        type="date"
                        className="text-sm"
                      />
                    </div>
                  </div>
                )}

                {!isCoverVisible && (
                  <div className="flex items-start gap-4 opacity-60 hover:opacity-100 transition-opacity">
                    <label className="text-sm font-medium text-muted-foreground min-w-[80px] pt-2">
                      Cover
                    </label>
                    <div className="flex-1 max-w-md space-y-2">
                      <Input
                        {...form.register("cover")}
                        placeholder="https://example.com/image.jpg"
                        className="text-sm"
                      />
                      {form.watch("cover") && (
                        <img
                          src={form.watch("cover")}
                          alt="Cover"
                          className="max-w-xs rounded-lg border"
                        />
                      )}
                    </div>
                  </div>
                )}

                {!isTagsVisible && (
                  <div className="flex items-start gap-4 opacity-60 hover:opacity-100 transition-opacity">
                    <label className="text-sm font-medium text-muted-foreground min-w-[80px] pt-2">
                      Tags
                    </label>
                    <div className="flex-1 max-w-md">
                      <Input
                        placeholder="tag1, tag2, tag3"
                        onChange={(e) => {
                          const tags = e.target.value
                            .split(",")
                            .map((t) => t.trim())
                            .filter(Boolean);
                          form.setValue("tags", tags);
                        }}
                        className="text-sm"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Separate with commas
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ALL RICH TEXT FIELDS SECTION */}
          {/* Content Section - Notion-style, main content area */}
          {isContentVisible && (
            <div className="pt-4">
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
            <div key={field.slug} className="pt-2">
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
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-8 mt-8 border-t">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              form.setValue("published", false);
              handleSave();
            }}
            disabled={isSaving}
          >
            Save Draft
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
                Publishing...
              </>
            ) : (
              <>
                <SaveIcon className="size-4 mr-2" />
                Publish
              </>
            )}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
