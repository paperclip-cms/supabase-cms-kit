"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { itemSchema } from "@/lib/schemas";
import { z } from "zod";
import { CollectionConfig, FieldType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "./rich-text-editor";
import { FieldInput } from "./field-inputs";
import { FieldRow } from "./field-row";
import { renderBuiltInField } from "./built-in-field-renderer";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader2Icon, SaveIcon } from "lucide-react";
import {
  getVisibleFields,
  getHiddenFields,
  isFieldVisible,
} from "@/lib/item-fields";
import { BUILT_IN_FIELDS } from "@/lib/field-options";
import { slugify } from "@/lib/utils";
import { useNavigationGuard } from "next-navigation-guard";

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

  // Initialize boolean custom fields to false
  const initialItemData = useMemo(() => {
    const data: Record<string, unknown> = {};
    collectionConfig.customFields?.forEach((field) => {
      if (field.type === FieldType.Boolean) {
        data[field.slug] = false;
      }
    });
    return data;
  }, [collectionConfig.customFields]);

  const form = useForm<ItemFormInput>({
    resolver: zodResolver(itemSchema),
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
      item_data: initialItemData,
    },
  });

  useNavigationGuard({
    enabled: form.formState.isDirty && !isSaving,
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
          : "Failed to save item. Please try again.",
      );
      setIsSaving(false);
    } finally {
      console.log("finally");
    }
  });

  // Core fields are always visible
  const slugField = BUILT_IN_FIELDS.find((f) => f.slug === "slug")!;
  const contentField = BUILT_IN_FIELDS.find((f) => f.slug === "content")!;

  // Content can be hidden (it's "core" but optional for some collections)
  const isContentVisible = isFieldVisible(contentField, collectionConfig);

  // Get optional metadata fields (excluding title, slug, content which are handled separately)
  const visibleMetadataFields = getVisibleFields(collectionConfig, [
    "title",
    "slug",
    "content",
  ]);
  const hiddenMetadataFields = getHiddenFields(collectionConfig, [
    "title",
    "slug",
    "content",
  ]);

  // Get custom fields
  const customFields = collectionConfig.customFields || [];
  const richTextFields = customFields.filter(
    (f) => f.type === FieldType.RichText,
  );
  const nonRichTextFields = customFields.filter(
    (f) => f.type !== FieldType.RichText,
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
          {/* Title Section - Core field, always visible */}
          <div>
            <Input
              {...form.register("title")}
              placeholder={`${collectionLabel} title...`}
              className="text-5xl font-bold border-none shadow-none px-0 py-3 h-auto focus-visible:ring-0 placeholder:text-muted-foreground/30"
            />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive mt-2">
                {form.formState.errors.title.message as string}
              </p>
            )}
          </div>

          {/* Metadata Section - Compact properties */}
          <div className="space-y-4">
            {/* Slug - Core field, always visible */}
            <FieldRow label={slugField.label}>
              {renderBuiltInField(slugField, form)}
              {form.formState.errors.slug && (
                <p className="text-xs text-destructive mt-1">
                  {form.formState.errors.slug.message as string}
                </p>
              )}
            </FieldRow>

            {/* Visible built-in metadata fields */}
            {visibleMetadataFields.map((field) => (
              <FieldRow key={field.slug} label={field.label}>
                {renderBuiltInField(field, form)}
              </FieldRow>
            ))}

            {/* Custom non-richtext fields */}
            {nonRichTextFields.map((field) => (
              <FieldRow
                key={field.slug}
                label={field.label}
                required={field.required}
              >
                <FieldInput
                  field={field}
                  value={form.watch(`item_data.${field.slug}`)}
                  onChange={(value) =>
                    form.setValue(`item_data.${field.slug}`, value)
                  }
                  error={form.formState.errors.item_data?.[field.slug]?.message}
                />
              </FieldRow>
            ))}

            {/* Hidden Properties Toggle */}
            {hiddenMetadataFields.length > 0 && (
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

            {/* Hidden built-in metadata fields */}
            {showAllProperties &&
              hiddenMetadataFields.map((field) => (
                <FieldRow key={field.slug} label={field.label} hidden>
                  {renderBuiltInField(field, form)}
                </FieldRow>
              ))}
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
                value={form.watch(`item_data.${field.slug}`)}
                onChange={(value) =>
                  form.setValue(`item_data.${field.slug}`, value)
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
