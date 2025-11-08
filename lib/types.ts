export enum FieldType {
  Text = "Text",
  Textarea = "Textarea",
  RichText = "Rich Text",
  Number = "Number",
  Boolean = "Boolean",
  Date = "Date",
  DateTime = "Date & Time",
  Select = "Select",
  MultiSelect = "Multi-Select",
  Image = "Image",
  Images = "Images",
  File = "File",
  Json = "JSON",
}

export type FieldValueType = {
  [FieldType.Text]: string;
  [FieldType.Textarea]: string;
  [FieldType.RichText]: string;
  [FieldType.Number]: number;
  [FieldType.Boolean]: boolean;
  [FieldType.Date]: string;
  [FieldType.DateTime]: string;
  [FieldType.Select]: string;
  [FieldType.MultiSelect]: string[];
  [FieldType.Image]: string;
  [FieldType.Images]: string[];
  [FieldType.File]: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [FieldType.Json]: any;
};

const _valueTypeCheck = null! as FieldValueType satisfies Record<
  FieldType,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any
>;

// Simple, flexible option storage - just type and value pairs
// Uses `unknown` instead of `any` for type safety - must be narrowed before use
export type FieldOption = {
  type: string;
  value: unknown;
};

export type FieldConfig = {
  slug: string;
  label: string;
  type: FieldType;
  required: boolean;
  description?: string;
  options?: FieldOption[];
};

export type BuiltInFieldSettings = {
  visible: boolean;
  required: boolean;
};

export type CollectionConfig = {
  customFields?: FieldConfig[];
  builtInFields?: {
    [fieldSlug: string]: BuiltInFieldSettings;
  };
};
