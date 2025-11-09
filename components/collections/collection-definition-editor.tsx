"use client";

import { useState } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import type { CollectionEditFormData } from "@/lib/collection-edit-schema";
import type { FieldConfig, BuiltInFieldSettings } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FieldEditorDialog } from "./field-editor-dialog";
import { FieldRow } from "./field-row";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BUILT_IN_FIELDS } from "@/lib/field-options";

export function CollectionDefinitionEditor() {
  const form = useFormContext<CollectionEditFormData>();

  const { fields, append, update, remove } = useFieldArray({
    control: form.control,
    name: "customFields",
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const builtInFields = form.watch("builtInFields") || {};

  const getBuiltInFieldSettings = (slug: string): BuiltInFieldSettings => {
    return builtInFields[slug] || { visible: true, required: false };
  };

  const handleBuiltInFieldChange = (
    slug: string,
    settings: Partial<BuiltInFieldSettings>,
  ) => {
    const currentSettings = getBuiltInFieldSettings(slug);
    const newSettings = { ...currentSettings, ...settings };

    form.setValue(
      "builtInFields",
      {
        ...builtInFields,
        [slug]: newSettings,
      },
      { shouldDirty: true },
    );
  };

  const handleAddField = () => {
    console.log("handleAddField called");
    setEditingIndex(null);
    setDialogOpen(true);
  };

  const handleEditField = (index: number) => {
    setEditingIndex(index);
    setDialogOpen(true);
  };

  const handleSaveField = (field: FieldConfig) => {
    if (editingIndex !== null) {
      update(editingIndex, field);
      toast.success("Field updated");
    } else {
      append(field);
      toast.success("Field added");
    }
    setDialogOpen(false);
  };

  const handleDeleteField = (index: number) => {
    remove(index);
    toast.success("Field removed");
  };

  const handleCopySlug = async (slug: string) => {
    await navigator.clipboard.writeText(slug);
    setCopiedSlug(slug);
    toast.success("Slug copied to clipboard");
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <h3 className="text-sm font-semibold">Built-in Fields</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Core fields provided by Paperclip. Configure visibility and
                validation for your collection.
              </p>
            </div>
          </div>

          <div className="border rounded-lg">
            <div className="flex items-center gap-4 px-4 py-2 bg-muted/50 border-b">
              <div className="w-4"></div>
              <div className="flex-1 text-xs font-medium text-muted-foreground">
                Field
              </div>
              <div className="text-xs font-medium text-muted-foreground min-w-[90px]">
                Required
              </div>
            </div>

            <div className="divide-y">
              {BUILT_IN_FIELDS.sort((a, b) =>
                a.category === "core" ? -1 : b.category === "core" ? 1 : 0,
              ).map((field) => (
                <FieldRow
                  key={field.slug}
                  field={field}
                  settings={getBuiltInFieldSettings(field.slug)}
                  isBuiltIn={true}
                  isCore={field.category === "core"}
                  copiedSlug={copiedSlug}
                  onCopySlug={handleCopySlug}
                  onVisibilityChange={(visible, required) =>
                    handleBuiltInFieldChange(field.slug, { visible, required })
                  }
                  onRequiredChange={(required) =>
                    handleBuiltInFieldChange(field.slug, { required })
                  }
                />
              ))}
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Custom Fields</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Add fields specific to this collection
              </p>
            </div>
            <Button type="button" onClick={handleAddField} size="sm">
              <PlusIcon />
              Add Field
            </Button>
          </div>

          {fields.length === 0 ? (
            <div className="border border-dashed rounded-lg p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No custom fields yet. Add your first custom field to get
                started.
              </p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <div className="divide-y">
                {fields.map((field, index) => (
                  <FieldRow
                    key={field.id}
                    field={field}
                    isBuiltIn={false}
                    required={field.required}
                    copiedSlug={copiedSlug}
                    onCopySlug={handleCopySlug}
                    onEdit={() => handleEditField(index)}
                    onDelete={() => handleDeleteField(index)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <FieldEditorDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          field={
            editingIndex !== null
              ? (fields[editingIndex] as FieldConfig)
              : undefined
          }
          onSave={handleSaveField}
          existingSlugs={[
            ...BUILT_IN_FIELDS.map((f) => f.slug),
            ...fields.map((f) => f.slug),
          ]}
        />
      </div>
    </TooltipProvider>
  );
}
