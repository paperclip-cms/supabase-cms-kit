"use client";

import * as React from "react";
import {
  FieldConfig,
  CollectionConfig,
  BuiltInFieldSettings,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldEditorDialog } from "./field-editor-dialog";
import { PlusIcon, PencilIcon, TrashIcon } from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
      // Adding new field - check for duplicate slug
      if (customFields.some((f) => f.slug === field.slug)) {
        toast.error("A field with this slug already exists");
        return;
      }
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

  const renderBuiltInField = (field: BuiltInField) => {
    const settings = getBuiltInFieldSettings(field.slug);
    const isCore = field.category === "core";
    const copied = copiedSlug === field.slug;

    return (
      <div
        key={field.slug}
        className="flex items-center gap-4 px-4 py-2.5 hover:bg-accent/50 transition-colors group"
      >
        {/* Visibility checkbox */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Checkbox
                checked={isCore || settings.visible}
                disabled={isCore}
                onCheckedChange={(checked) =>
                  handleBuiltInFieldChange(field.slug, {
                    visible: checked as boolean,
                    required: checked ? settings.required : false,
                  })
                }
              />
            </div>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>
              {isCore
                ? "Always visible"
                : settings.visible
                  ? "Hide from forms"
                  : "Show in forms"}
            </p>
          </TooltipContent>
        </Tooltip>

        {/* Field info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{field.label}</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <code
                  className="text-xs px-1.5 py-0.5 bg-muted/50 rounded font-mono text-muted-foreground hover:bg-muted cursor-pointer transition-colors"
                  onClick={() => handleCopySlug(field.slug)}
                >
                  {field.slug}
                </code>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>{copied ? "Copied!" : "Click to copy"}</p>
              </TooltipContent>
            </Tooltip>
            <span className="text-xs text-muted-foreground">
              • {field.type}
            </span>
          </div>
        </div>

        {/* Required checkbox */}
        <Tooltip>
          <TooltipTrigger asChild>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={isCore || settings.required}
                disabled={isCore || !settings.visible}
                onCheckedChange={(checked) =>
                  handleBuiltInFieldChange(field.slug, {
                    required: checked as boolean,
                  })
                }
              />
              <span className="text-xs text-muted-foreground min-w-[60px]">
                Required
              </span>
            </label>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>
              {isCore
                ? "Always required"
                : !settings.visible
                  ? "Field must be visible to be required"
                  : settings.required
                    ? "Make optional"
                    : "Make required"}
            </p>
          </TooltipContent>
        </Tooltip>
      </div>
    );
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
              {BUILT_IN_FIELDS.filter((f) => f.category === "core").map(
                renderBuiltInField,
              )}
              {BUILT_IN_FIELDS.filter((f) => f.category === "optional").map(
                renderBuiltInField,
              )}
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
                {customFields.map((field) => {
                  const copied = copiedSlug === field.slug;

                  return (
                    <div
                      key={field.slug}
                      className="flex items-center gap-4 px-4 py-2.5 hover:bg-accent/50 transition-colors group"
                    >
                      {/* Field info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {field.label}
                          </span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <code
                                className="text-xs px-1.5 py-0.5 bg-muted/50 rounded font-mono text-muted-foreground hover:bg-muted cursor-pointer transition-colors"
                                onClick={() => handleCopySlug(field.slug)}
                              >
                                {field.slug}
                              </code>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <p>{copied ? "Copied!" : "Click to copy"}</p>
                            </TooltipContent>
                          </Tooltip>
                          <span className="text-xs text-muted-foreground">
                            • {field.type.toLowerCase()}
                          </span>
                          {field.required && (
                            <span className="text-xs text-muted-foreground">
                              • Required
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditField(field)}
                        >
                          <PencilIcon />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteField(field.slug)}
                        >
                          <TrashIcon />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <FieldEditorDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          field={editingField}
          onSave={handleSaveField}
        />
      </div>
    </TooltipProvider>
  );
}
