import { CollectionConfig, FieldType } from "@/lib/types";
import { BUILT_IN_FIELDS } from "@/lib/field-options";
import { isFieldVisible } from "@/lib/item-fields";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import type { Json } from "@/lib/supabase/types";

interface ItemViewProps {
  item: {
    id: string;
    slug: string;
    title: string;
    content: string | null;
    author: string | null;
    date: string | null;
    tags: string[];
    cover: string | null;
    published_at: string | null;
    created_at: string;
    updated_at: string;
    item_data: Json;
  };
  collectionConfig: CollectionConfig;
}

export function ItemView({ item, collectionConfig }: ItemViewProps) {
  // Get visible built-in fields (excluding title, slug, content which are handled separately)
  const visibleBuiltInFields = BUILT_IN_FIELDS.filter(
    (field) =>
      !["title", "slug", "content"].includes(field.slug) &&
      isFieldVisible(field, collectionConfig),
  );

  // Check if content field is visible
  const contentField = BUILT_IN_FIELDS.find((f) => f.slug === "content")!;
  const isContentVisible = isFieldVisible(contentField, collectionConfig);

  // Get custom fields
  const customFields = collectionConfig.customFields || [];
  const richTextFields = customFields.filter(
    (f) => f.type === FieldType.RichText,
  );
  const nonRichTextFields = customFields.filter(
    (f) => f.type !== FieldType.RichText,
  );

  const renderBuiltInFieldValue = (fieldSlug: string) => {
    const value = item[fieldSlug as keyof typeof item];

    if (value === null || value === undefined || value === "") {
      return <span className="text-muted-foreground italic">Not set</span>;
    }

    switch (fieldSlug) {
      case "date":
        return format(new Date(value as string), "PPP");
      case "tags":
        return (
          <div className="flex flex-wrap gap-2">
            {(value as string[]).map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        );
      case "cover":
        return (
          <img
            src={value as string}
            alt="Cover"
            className="max-w-md rounded-lg border"
          />
        );
      case "author":
        return <span>{value as string}</span>;
      default:
        return <span>{String(value)}</span>;
    }
  };

  const renderCustomFieldValue = (
    fieldSlug: string,
    fieldType: FieldType,
  ): React.ReactNode => {
    const itemData = item.item_data as Record<string, unknown> | null;
    const value = itemData?.[fieldSlug];

    if (value === null || value === undefined || value === "") {
      return <span className="text-muted-foreground italic">Not set</span>;
    }

    switch (fieldType) {
      case FieldType.Boolean:
        return <span>{value ? "Yes" : "No"}</span>;
      case FieldType.Date:
        return format(new Date(value as string), "PPP");
      case FieldType.DateTime:
        return format(new Date(value as string), "PPPp");
      case FieldType.MultiSelect:
        return (
          <div className="flex flex-wrap gap-2">
            {(value as string[]).map((item) => (
              <Badge key={item} variant="secondary">
                {item}
              </Badge>
            ))}
          </div>
        );
      case FieldType.Image:
        return (
          <img
            src={value as string}
            alt="Image"
            className="max-w-md rounded-lg border"
          />
        );
      case FieldType.Images:
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {(value as string[]).map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt={`Image ${idx + 1}`}
                className="w-full rounded-lg border"
              />
            ))}
          </div>
        );
      case FieldType.Json:
        return (
          <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto max-w-full">
            {JSON.stringify(value, null, 2)}
          </pre>
        );
      case FieldType.File:
        return (
          <a
            href={value as string}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            View file
          </a>
        );
      default:
        return <span>{String(value)}</span>;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Title */}
      <h1 className="text-5xl font-bold">{item.title}</h1>

      {/* Metadata section */}
      {(visibleBuiltInFields.length > 0 || nonRichTextFields.length > 0) && (
        <div className="space-y-4 py-6 border-y">
          {/* Built-in fields */}
          {visibleBuiltInFields.map((field) => {
            const value = item[field.slug as keyof typeof item];
            // Skip if empty and not tags/cover (which have special rendering)
            if (
              !value &&
              field.slug !== "tags" &&
              field.slug !== "cover" &&
              field.slug !== "author"
            ) {
              return null;
            }
            return (
              <div
                key={field.slug}
                className="flex flex-col md:flex-row md:items-start gap-2"
              >
                <div className="min-w-[120px] text-sm text-muted-foreground font-medium">
                  {field.label}
                </div>
                <div className="flex-1 text-sm">
                  {renderBuiltInFieldValue(field.slug)}
                </div>
              </div>
            );
          })}

          {/* Custom non-richtext fields */}
          {nonRichTextFields.map((field) => {
            const itemData = item.item_data as Record<string, unknown> | null;
            const value = itemData?.[field.slug];
            // Skip if empty
            if (!value && value !== false && value !== 0) {
              return null;
            }
            return (
              <div
                key={field.slug}
                className="flex flex-col md:flex-row md:items-start gap-2"
              >
                <div className="min-w-[120px] text-sm text-muted-foreground font-medium">
                  {field.label}
                  {field.required && (
                    <span className="text-destructive ml-1">*</span>
                  )}
                </div>
                <div className="flex-1 text-sm">
                  {renderCustomFieldValue(field.slug, field.type)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Content Section */}
      {isContentVisible && item.content && (
        <div
          className="prose prose-neutral dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: item.content }}
        />
      )}

      {/* Additional Rich Text Fields */}
      {richTextFields.map((field) => {
        const itemData = item.item_data as Record<string, unknown> | null;
        const value = itemData?.[field.slug] as string | undefined;
        if (!value) return null;

        return (
          <div key={field.slug} className="space-y-3">
            <h2 className="text-2xl font-bold">{field.label}</h2>
            <div
              className="prose prose-neutral dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: value }}
            />
          </div>
        );
      })}

      {/* Timestamps */}
      <div className="text-xs text-muted-foreground space-y-1 pt-8 border-t">
        {item.published_at && (
          <div>
            Published: {format(new Date(item.published_at), "PPPp")}
          </div>
        )}
        <div>Created: {format(new Date(item.created_at), "PPPp")}</div>
        <div>Updated: {format(new Date(item.updated_at), "PPPp")}</div>
      </div>
    </div>
  );
}
