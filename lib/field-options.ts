import { FieldType } from "./types";

export enum OptionValueType {
  String = "string",
  Number = "number",
  StringArray = "string-array",
  ChoiceArray = "choice-array",
  Select = "select",
}

// Type-safe values for field options
export type FieldOptionValue =
  | string
  | number
  | string[]
  | Array<{ label: string; value: string }>;

// UI configuration for rendering each option type
export type OptionUIConfig = {
  valueType: OptionValueType;
  label: string;
  placeholder?: string;
  suffix?: string;
  helpText?: string;
  choices?: Array<{ label: string; value: string }>;
};

// Define UI config for each option
export const OPTION_UI_CONFIG: Record<string, OptionUIConfig> = {
  placeholder: {
    valueType: OptionValueType.String,
    label: "Placeholder (optional)",
    placeholder: "Enter placeholder text...",
  },
  defaultValue: {
    valueType: OptionValueType.String,
    label: "Default Value (optional)",
    placeholder: "Enter default value...",
  },
  maxSize: {
    valueType: OptionValueType.Number,
    label: "Max File Size (optional)",
    placeholder: "e.g., 5",
    suffix: "MB",
    helpText: "Maximum file size in megabytes",
  },
  accept: {
    valueType: OptionValueType.StringArray,
    label: "Accepted File Types (optional)",
    placeholder: "e.g., .pdf, .doc, image/*",
    helpText: "Examples: .pdf, .docx, image/*, video/*",
  },
  choices: {
    valueType: OptionValueType.ChoiceArray,
    label: "Choices",
  },
  defaultOutput: {
    valueType: OptionValueType.Select,
    label: "Default Output Format",
    choices: [
      { label: "Markdown", value: "markdown" },
      { label: "HTML", value: "html" },
    ],
    helpText: "Choose how the rich text content will be stored",
  },
};

export type OptionKey = keyof typeof OPTION_UI_CONFIG;

// Map each field type to its available options
export const FIELD_TYPE_OPTIONS = {
  [FieldType.Text]: ["placeholder", "defaultValue"],
  [FieldType.Textarea]: ["placeholder", "defaultValue"],
  [FieldType.RichText]: ["placeholder", "defaultValue", "defaultOutput"],
  [FieldType.Number]: ["placeholder", "defaultValue"],
  [FieldType.Boolean]: ["defaultValue"],
  [FieldType.Date]: ["defaultValue"],
  [FieldType.DateTime]: ["defaultValue"],
  [FieldType.Select]: ["placeholder", "defaultValue", "choices"],
  [FieldType.MultiSelect]: ["defaultValue", "choices"],
  [FieldType.Image]: ["maxSize"],
  [FieldType.Images]: ["maxSize"],
  [FieldType.File]: ["maxSize", "accept"],
  [FieldType.Json]: [],
} as const satisfies Record<FieldType, readonly OptionKey[]>;

// Helper to get options for a field type
export function getOptionsForFieldType(
  fieldType: FieldType,
): readonly OptionKey[] {
  return FIELD_TYPE_OPTIONS[fieldType];
}

// Helper to get the UI config for an option
export function getOptionUIConfig(optionKey: OptionKey): OptionUIConfig {
  return OPTION_UI_CONFIG[optionKey];
}

type BuiltInFieldCategory = "core" | "optional";

export interface BuiltInField {
  slug: string;
  label: string;
  type: string;
  category: BuiltInFieldCategory;
  description: string;
}

export const BUILT_IN_FIELDS: BuiltInField[] = [
  {
    slug: "title",
    label: "Title",
    type: "text",
    category: "core",
    description: "Primary title of the item (required, always visible)",
  },
  {
    slug: "slug",
    label: "Slug",
    type: "text",
    category: "core",
    description: "URL-friendly identifier (required, always visible)",
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
