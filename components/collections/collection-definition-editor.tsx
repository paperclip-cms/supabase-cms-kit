"use client";

import * as React from "react";
import {
  FieldConfig,
  CollectionConfig,
  BuiltInFieldSettings,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FieldEditorDialog } from "./field-editor-dialog";
import { FieldRow } from "./field-row";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

type BuiltInFieldCategory = "core" | "optional";

interface BuiltInField {
  slug: string;
  label: string;
  type: string; // Display string only - built-in fields don't use FieldType enum
  category: BuiltInFieldCategory;
  description: string;
}

interface CollectionDefinitionEditorProps {
  config: CollectionConfig;
  onChange: (config: CollectionConfig) => void;
}

const BUILT_IN_FIELDS: BuiltInField[] = [
  {
    slug: "title",
    label: "Title",
    type: "text",
    category: "core",
    description: "Primary title of the item (required, always visible)",
  },
  {
    slug: "author",
    label: "Author",
    type: "text",
    category: "optional",
    description: "Author name or byline",
  },
  {
    slug: "content",
    label: "Content",
    type: "richtext",
    category: "optional",
    description: "Main content body with rich text formatting",
  },
  {
    slug: "date",
    label: "Date",
    type: "date",
    category: "optional",
    description: "Custom date field for your content",
  },
  {
    slug: "tags",
    label: "Tags",
    type: "tags",
    category: "optional",
    description: "Free-form categorization tags",
  },
  {
    slug: "cover",
    label: "Cover Image",
    type: "image",
    category: "optional",
    description: "Featured image or thumbnail",
  },
];

export function CollectionDefinitionEditor({
  config,
  onChange,
}: CollectionDefinitionEditorProps) {
  const [customFields, setCustomFields] = React.useState<FieldConfig[]>(
    config.customFields || [],
  );
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingField, setEditingField] = React.useState<
    FieldConfig | undefined
  >();
  const [copiedSlug, setCopiedSlug] = React.useState<string | null>(null);

  // Initialize built-in field settings with defaults
  const getBuiltInFieldSettings = (slug: string): BuiltInFieldSettings => {
    return config.builtInFields?.[slug] || { visible: true, required: false };
  };

  React.useEffect(() => {
    setCustomFields(config.customFields || []);
  }, [config]);

  const handleBuiltInFieldChange = (
    slug: string,
    settings: Partial<BuiltInFieldSettings>,
  ) => {
    const currentSettings = getBuiltInFieldSettings(slug);
    const newSettings = { ...currentSettings, ...settings };

    onChange({
      ...config,
      builtInFields: {
        ...config.builtInFields,
        [slug]: newSettings,
      },
    });
  };

  const handleAddField = () => {
    setEditingField(undefined);
    setDialogOpen(true);
  };

  const handleEditField = (field: FieldConfig) => {
    setEditingField(field);
    setDialogOpen(true);
  };

  const handleSaveField = (field: FieldConfig) => {
    let updated: FieldConfig[];

    if (editingField) {
      // Editing existing field
      updated = customFields.map((f) =>
        f.slug === editingField.slug ? field : f,
      );
    } else {
      // Adding new field
      updated = [...customFields, field];
    }

    setCustomFields(updated);
    onChange({ ...config, customFields: updated });
    toast.success(editingField ? "Field updated" : "Field added");
  };

  const handleDeleteField = (slug: string) => {
    const updated = customFields.filter((f) => f.slug !== slug);
    setCustomFields(updated);
    onChange({ ...config, customFields: updated });
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
        {/* Built-in Fields Section */}
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
            {/* Header */}
            <div className="flex items-center gap-4 px-4 py-2 bg-muted/50 border-b">
              <div className="w-4"></div>
              <div className="flex-1 text-xs font-medium text-muted-foreground">
                Field
              </div>
              <div className="text-xs font-medium text-muted-foreground min-w-[90px]">
                Required
              </div>
            </div>

            {/* Fields */}
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

        {/* Custom Fields Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Custom Fields</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Add fields specific to this collection
              </p>
            </div>
            <Button onClick={handleAddField} size="sm">
              <PlusIcon />
              Add Field
            </Button>
          </div>

          {customFields.length === 0 ? (
            <div className="border border-dashed rounded-lg p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No custom fields yet. Add your first custom field to get
                started.
              </p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <div className="divide-y">
                {customFields.map((field) => (
                  <FieldRow
                    key={field.slug}
                    field={field}
                    isBuiltIn={false}
                    required={field.required}
                    copiedSlug={copiedSlug}
                    onCopySlug={handleCopySlug}
                    onEdit={handleEditField}
                    onDelete={handleDeleteField}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <FieldEditorDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          field={editingField}
          onSave={handleSaveField}
          existingSlugs={[
            ...BUILT_IN_FIELDS.map((f) => f.slug),
            ...customFields.map((f) => f.slug),
          ]}
        />
      </div>
    </TooltipProvider>
  );
}
