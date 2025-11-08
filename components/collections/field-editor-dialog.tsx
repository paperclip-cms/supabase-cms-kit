"use client";

import * as React from "react";
import { FieldConfig, FieldType, FieldOption } from "@/lib/types";
import {
  getOptionsForFieldType,
  getOptionUIConfig,
  OptionValueType,
  FieldOptionValue,
} from "@/lib/field-options";
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
import { PlusIcon, XIcon } from "lucide-react";
import { slugify } from "@/lib/utils";

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

  // Auto-generate slug from label
  const slug = React.useMemo(() => slugify(label), [label]);

  // Options data (stored as key-value map internally, converted to array on save)
  const [optionsData, setOptionsData] = React.useState<
    Record<string, FieldOptionValue>
  >({});

  // Temporary state for adding items to arrays
  const [newAcceptType, setNewAcceptType] = React.useState("");

  // Initialize form from field prop
  React.useEffect(() => {
    if (field) {
      setLabel(field.label);
      setType(field.type);
      setRequired(field.required);
      setDescription(field.description ?? "");

      // Convert options array to key-value map
      const optionsMap: Record<string, FieldOptionValue> = {};
      if (field.options) {
        for (const option of field.options) {
          // Convert bytes to MB for maxSize
          if (option.type === "maxSize" && typeof option.value === "number") {
            optionsMap[option.type] = option.value / (1024 * 1024);
          } else {
            optionsMap[option.type] = option.value;
          }
        }
      }
      setOptionsData(optionsMap);
    } else {
      // Reset to defaults for new field
      setLabel("");
      setType(FieldType.Text);
      setRequired(false);
      setDescription("");
      setOptionsData({});
    }
    setNewAcceptType("");
  }, [field, open]);

  const handleTypeChange = (newType: FieldType) => {
    setType(newType);
    // Reset options when changing type
    setOptionsData({});
  };

  const handleSave = () => {
    if (!slug || !label) {
      return;
    }

    // Convert options map to array
    const optionsArray: FieldOption[] = [];
    for (const [key, value] of Object.entries(optionsData)) {
      if (value !== undefined && value !== null) {
        // Filter out empty arrays and empty choice arrays
        if (Array.isArray(value) && value.length === 0) continue;
        if (key === "choices" && Array.isArray(value)) {
          // Filter out empty choices (we control the structure in the UI)
          const choices = value as Array<{ label: string; value: string }>;
          const validChoices = choices.filter((c) => c.label && c.value);
          if (validChoices.length === 0) continue;
          optionsArray.push({ type: key, value: validChoices });
        } else if (key === "maxSize" && typeof value === "number") {
          // Convert MB to bytes for storage
          optionsArray.push({
            type: key,
            value: value * 1024 * 1024,
          } as FieldOption);
        } else {
          optionsArray.push({ type: key, value } as FieldOption);
        }
      }
    }

    const fieldConfig: FieldConfig = {
      slug,
      label,
      type,
      required,
      description: description || undefined,
      options: optionsArray.length > 0 ? optionsArray : undefined,
    };

    onSave(fieldConfig);
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

          {/* Render all options dynamically based on field type */}
          {availableOptions.map((optionKey) => {
            const uiConfig = getOptionUIConfig(optionKey);

            if (uiConfig.valueType === OptionValueType.String) {
              const stringValue = optionsData[optionKey] as string | undefined;
              return (
                <div key={optionKey} className="space-y-2">
                  <Label htmlFor={`option-${optionKey}`}>
                    {uiConfig.label}
                  </Label>
                  <Input
                    id={`option-${optionKey}`}
                    type={
                      type === FieldType.Number && optionKey === "defaultValue"
                        ? "number"
                        : "text"
                    }
                    placeholder={uiConfig.placeholder}
                    value={stringValue ?? ""}
                    onChange={(e) =>
                      setOptionValue(optionKey, e.target.value || undefined)
                    }
                  />
                  {uiConfig.helpText && (
                    <p className="text-xs text-muted-foreground">
                      {uiConfig.helpText}
                    </p>
                  )}
                </div>
              );
            }

            if (uiConfig.valueType === OptionValueType.Number) {
              const numberValue = optionsData[optionKey] as number | undefined;
              return (
                <div key={optionKey} className="space-y-2">
                  <Label htmlFor={`option-${optionKey}`}>
                    {uiConfig.label}
                  </Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      id={`option-${optionKey}`}
                      type="number"
                      placeholder={uiConfig.placeholder}
                      value={numberValue ?? ""}
                      onChange={(e) =>
                        setOptionValue(
                          optionKey,
                          e.target.value ? Number(e.target.value) : undefined,
                        )
                      }
                    />
                    {uiConfig.suffix && (
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        {uiConfig.suffix}
                      </span>
                    )}
                  </div>
                  {uiConfig.helpText && (
                    <p className="text-xs text-muted-foreground">
                      {uiConfig.helpText}
                    </p>
                  )}
                </div>
              );
            }

            if (uiConfig.valueType === OptionValueType.StringArray) {
              const currentArray = (optionsData[optionKey] as string[]) ?? [];
              return (
                <div key={optionKey} className="space-y-2">
                  <Label>{uiConfig.label}</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder={uiConfig.placeholder}
                      value={newAcceptType}
                      onChange={(e) => setNewAcceptType(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newAcceptType.trim()) {
                          e.preventDefault();
                          setOptionValue(optionKey, [
                            ...currentArray,
                            newAcceptType.trim(),
                          ]);
                          setNewAcceptType("");
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (newAcceptType.trim()) {
                          setOptionValue(optionKey, [
                            ...currentArray,
                            newAcceptType.trim(),
                          ]);
                          setNewAcceptType("");
                        }
                      }}
                    >
                      <PlusIcon />
                      Add
                    </Button>
                  </div>
                  {currentArray.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {currentArray.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-1 px-2 py-1 bg-secondary rounded-md text-sm"
                        >
                          <span>{item}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 p-0"
                            onClick={() =>
                              setOptionValue(
                                optionKey,
                                currentArray.filter((_, i) => i !== index),
                              )
                            }
                          >
                            <XIcon className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  {uiConfig.helpText && (
                    <p className="text-xs text-muted-foreground">
                      {uiConfig.helpText}
                    </p>
                  )}
                </div>
              );
            }

            if (uiConfig.valueType === OptionValueType.ChoiceArray) {
              const currentChoices = (optionsData[optionKey] as Array<{
                label: string;
                value: string;
              }>) ?? [{ label: "", value: "" }];
              return (
                <div key={optionKey} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>{uiConfig.label}</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setOptionValue(optionKey, [
                          ...currentChoices,
                          { label: "", value: "" },
                        ])
                      }
                    >
                      <PlusIcon />
                      Add Choice
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {currentChoices.map((choice, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder="Label"
                          value={choice.label}
                          onChange={(e) => {
                            const updated = [...currentChoices];
                            updated[index].label = e.target.value;
                            setOptionValue(optionKey, updated);
                          }}
                        />
                        <Input
                          placeholder="Value"
                          value={choice.value}
                          onChange={(e) => {
                            const updated = [...currentChoices];
                            updated[index].value = e.target.value;
                            setOptionValue(optionKey, updated);
                          }}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setOptionValue(
                              optionKey,
                              currentChoices.filter((_, i) => i !== index),
                            )
                          }
                          disabled={currentChoices.length === 1}
                        >
                          <XIcon />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            if (
              uiConfig.valueType === OptionValueType.Select &&
              uiConfig.choices
            ) {
              const selectValue = optionsData[optionKey] as string | undefined;
              return (
                <div key={optionKey} className="space-y-2">
                  <Label htmlFor={`option-${optionKey}`}>
                    {uiConfig.label}
                  </Label>
                  <Select
                    value={selectValue ?? uiConfig.choices[0].value}
                    onValueChange={(value) => setOptionValue(optionKey, value)}
                  >
                    <SelectTrigger id={`option-${optionKey}`}>
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      {uiConfig.choices.map((choice) => (
                        <SelectItem key={choice.value} value={choice.value}>
                          {choice.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {uiConfig.helpText && (
                    <p className="text-xs text-muted-foreground">
                      {uiConfig.helpText}
                    </p>
                  )}
                </div>
              );
            }

            return null;
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
