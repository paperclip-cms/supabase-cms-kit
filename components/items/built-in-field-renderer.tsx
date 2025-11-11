"use client";

import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { BuiltInField } from "@/lib/field-options";
import { ReactNode } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CoverFieldInput } from "./field-inputs/cover-field-input";

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

    case "date": {
      const dateValue = form.watch("date");
      const date = dateValue ? new Date(dateValue) : undefined;

      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal text-sm",
                !date && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(selectedDate) => {
                if (selectedDate) {
                  form.setValue("date", format(selectedDate, "yyyy-MM-dd"));
                } else {
                  form.setValue("date", "");
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      );
    }

    case "cover":
      return <CoverFieldInput form={form} />;

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
