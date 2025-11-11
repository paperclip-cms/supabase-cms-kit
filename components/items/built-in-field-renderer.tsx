import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { BuiltInField } from "@/lib/field-options";
import { ReactNode } from "react";

/**
 * Renders the input for a built-in field based on its type.
 * Returns the field input JSX (not including label/wrapper).
 */
export function renderBuiltInField(
  field: BuiltInField,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>,
): ReactNode {
  switch (field.slug) {
    case "slug":
      return (
        <Input
          {...form.register("slug")}
          placeholder="auto-generated-slug"
          className="text-sm"
        />
      );

    case "author":
      return (
        <Input
          {...form.register("author")}
          placeholder="Author name"
          className="text-sm"
        />
      );

    case "date":
      return (
        <Input {...form.register("date")} type="date" className="text-sm" />
      );

    case "cover":
      return (
        <div className="space-y-2">
          <Input
            {...form.register("cover")}
            placeholder="https://example.com/image.jpg"
            className="text-sm"
          />
          {form.watch("cover") && (
            <img
              src={form.watch("cover")}
              alt="Cover"
              className="max-w-xs rounded-lg border"
            />
          )}
        </div>
      );

    case "tags":
      return (
        <>
          <Input
            placeholder="tag1, tag2, tag3"
            onChange={(e) => {
              const tags = e.target.value
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean);
              form.setValue("tags", tags);
            }}
            className="text-sm"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Separate with commas
          </p>
        </>
      );

    default:
      return null;
  }
}
