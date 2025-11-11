import { FieldType, FieldConfig } from "@/lib/types";
import { TextFieldInput } from "./text-field-input";
import { TextareaFieldInput } from "./textarea-field-input";
import { RichTextFieldInput } from "./richtext-field-input";
import { NumberFieldInput } from "./number-field-input";
import { BooleanFieldInput } from "./boolean-field-input";
import { DateFieldInput } from "./date-field-input";
import { SelectFieldInput } from "./select-field-input";
import { MultiSelectFieldInput } from "./multi-select-field-input";
import { ImageFieldInput } from "./image-field-input";
import { FileFieldInput } from "./file-field-input";
import { JsonFieldInput } from "./json-field-input";

interface FieldInputProps {
  field: FieldConfig;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
}

export function FieldInput({ field, value, onChange, error }: FieldInputProps) {
  switch (field.type) {
    case FieldType.Text:
      return (
        <TextFieldInput
          field={field}
          value={value as string}
          onChange={onChange}
          error={error}
        />
      );
    case FieldType.Textarea:
      return (
        <TextareaFieldInput
          field={field}
          value={value as string}
          onChange={onChange}
          error={error}
        />
      );
    case FieldType.RichText:
      return (
        <RichTextFieldInput
          field={field}
          value={value as string}
          onChange={onChange}
          error={error}
        />
      );
    case FieldType.Number:
      return (
        <NumberFieldInput
          field={field}
          value={value as number}
          onChange={onChange}
          error={error}
        />
      );
    case FieldType.Boolean:
      return (
        <BooleanFieldInput
          field={field}
          value={value as boolean}
          onChange={onChange}
          error={error}
        />
      );
    case FieldType.Date:
    case FieldType.DateTime:
      return (
        <DateFieldInput
          field={field}
          value={value as string}
          onChange={onChange}
          error={error}
        />
      );
    case FieldType.Select:
      return (
        <SelectFieldInput
          field={field}
          value={value as string}
          onChange={onChange}
          error={error}
        />
      );
    case FieldType.MultiSelect:
      return (
        <MultiSelectFieldInput
          field={field}
          value={value as string[]}
          onChange={onChange}
          error={error}
        />
      );
    case FieldType.Image:
    case FieldType.Images:
      return (
        <ImageFieldInput
          field={field}
          value={value as string}
          onChange={onChange}
          error={error}
        />
      );
    case FieldType.File:
      return (
        <FileFieldInput
          field={field}
          value={value as string}
          onChange={onChange}
          error={error}
        />
      );
    case FieldType.Json:
      return (
        <JsonFieldInput
          field={field}
          value={value}
          onChange={onChange}
          error={error}
        />
      );
    default:
      return (
        <div className="text-sm text-muted-foreground">
          Field type not supported yet: {field.type}
        </div>
      );
  }
}
