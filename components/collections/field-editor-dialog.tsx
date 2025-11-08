"use client";

import * as React from "react";
import { FieldConfig, FieldType } from "@/lib/types";
import {
  getOptionsForFieldType,
  getOptionUIConfig,
  FieldOptionValue,
} from "@/lib/field-options";
import { fieldConfigSchema } from "@/lib/field-validation";
import {
  fieldConfigToOptionsMap,
  optionsMapToFieldOptions,
} from "@/lib/field-config-utils";
import { OPTION_INPUT_COMPONENTS } from "@/components/ui/field-option-inputs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { slugifyFieldName } from "@/lib/utils";
import { toast } from "sonner";

interface FieldEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  field?: FieldConfig;
  onSave: (field: FieldConfig) => void;
}

export function FieldEditorDialog({
  open,
  onOpenChange,
  field,
  onSave,
}: FieldEditorDialogProps) {
  const isEditing = !!field;

  // Base field data
  const [label, setLabel] = React.useState("");
  const [type, setType] = React.useState<FieldType>(FieldType.Text);
  const [required, setRequired] = React.useState(false);
  const [description, setDescription] = React.useState("");

  // Auto-generate slug from label (snake_case for object properties)
  const slug = React.useMemo(() => slugifyFieldName(label), [label]);

  // Options data (stored as key-value map internally, converted to array on save)
  const [optionsData, setOptionsData] = React.useState<
    Record<string, FieldOptionValue>
  >({});

  // Initialize form from field prop
  React.useEffect(() => {
    if (field) {
      setLabel(field.label);
      setType(field.type);
      setRequired(field.required);
      setDescription(field.description ?? "");
      // Use utility function to convert field config to options map
      setOptionsData(fieldConfigToOptionsMap(field));
    } else {
      // Reset to defaults for new field
      setLabel("");
      setType(FieldType.Text);
      setRequired(false);
      setDescription("");
      setOptionsData({});
    }
  }, [field, open]);

  const handleTypeChange = (newType: FieldType) => {
    setType(newType);
    // Reset options when changing type
    setOptionsData({});
  };

  const handleSave = () => {
    if (!slug || !label) {
      toast.error("Field label is required");
      return;
    }

    // Use utility function to convert options map to field options array
    const optionsArray = optionsMapToFieldOptions(optionsData);

    const fieldConfig: FieldConfig = {
      slug,
      label,
      type,
      required,
      description: description || undefined,
      options: optionsArray.length > 0 ? optionsArray : undefined,
    };

    // Validate field config before saving
    const validationResult = fieldConfigSchema.safeParse(fieldConfig);
    if (!validationResult.success) {
      const errorMessage = validationResult.error.issues[0].message;
      toast.error(errorMessage);
      return;
    }

    // Cast validated data back to FieldConfig for consistency
    onSave(validationResult.data as FieldConfig);
    onOpenChange(false);
  };

  const setOptionValue = (key: string, value: FieldOptionValue | undefined) => {
    if (value === undefined) {
      const { [key]: _, ...rest } = optionsData;
      setOptionsData(rest);
    } else {
      setOptionsData({ ...optionsData, [key]: value });
    }
  };

  const availableOptions = getOptionsForFieldType(type);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Field" : "Add Custom Field"}
          </DialogTitle>
          <DialogDescription>
            Define a custom field for this collection
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="field-label">Label</Label>
              <Input
                id="field-label"
                placeholder="Field Label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="field-slug">Slug</Label>
              <Input
                id="field-slug"
                placeholder="field_slug"
                value={slug}
                disabled
                className="bg-muted text-muted-foreground cursor-not-allowed font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Auto-generated from label
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="field-type">Type</Label>
            <Select
              value={type}
              onValueChange={(value: string) => {
                if (Object.values(FieldType).includes(value as FieldType)) {
                  handleTypeChange(value as FieldType);
                }
              }}
              disabled={isEditing}
            >
              <SelectTrigger id="field-type">
                <SelectValue placeholder="Select field type" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(FieldType).map((fieldType) => (
                  <SelectItem key={fieldType} value={fieldType}>
                    {fieldType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="field-description">Description (optional)</Label>
            <Textarea
              id="field-description"
              placeholder="Help text for this field"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="field-required">Required</Label>
            <Switch
              id="field-required"
              checked={required}
              onCheckedChange={setRequired}
            />
          </div>

          {/* Render all options dynamically using component registry */}
          {availableOptions.map((optionKey) => {
            const uiConfig = getOptionUIConfig(optionKey);
            const InputComponent = OPTION_INPUT_COMPONENTS[uiConfig.valueType];

            if (!InputComponent) {
              console.warn(
                `No input component for value type: ${uiConfig.valueType}`,
              );
              return null;
            }

            return (
              <InputComponent
                key={optionKey}
                value={optionsData[optionKey]}
                onChange={(value) =>
                  setOptionValue(
                    optionKey,
                    value as FieldOptionValue | undefined,
                  )
                }
                config={uiConfig}
              />
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {isEditing ? "Save Changes" : "Add Field"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
