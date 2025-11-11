"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { FieldConfig, FieldType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface DateFieldInputProps {
  field: FieldConfig;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function DateFieldInput({
  field,
  value,
  onChange,
  error,
}: DateFieldInputProps) {
  const isDateTime = field.type === FieldType.DateTime;
  const [timeValue, setTimeValue] = useState(() => {
    if (isDateTime && value) {
      try {
        const date = new Date(value);
        return format(date, "HH:mm");
      } catch {
        return "12:00";
      }
    }
    return "12:00";
  });

  const date = value ? new Date(value) : undefined;

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) {
      onChange("");
      return;
    }

    if (isDateTime) {
      // Combine date with time
      const [hours, minutes] = timeValue.split(":").map(Number);
      selectedDate.setHours(hours, minutes, 0, 0);
      onChange(selectedDate.toISOString());
    } else {
      // Date only - use ISO date string (YYYY-MM-DD)
      onChange(format(selectedDate, "yyyy-MM-dd"));
    }
  };

  const handleTimeChange = (newTime: string) => {
    setTimeValue(newTime);
    if (date) {
      const [hours, minutes] = newTime.split(":").map(Number);
      const newDate = new Date(date);
      newDate.setHours(hours, minutes, 0, 0);
      onChange(newDate.toISOString());
    }
  };

  return (
    <div className="space-y-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground",
              error && "border-destructive",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? (
              isDateTime ? (
                format(date, "PPP 'at' p")
              ) : (
                format(date, "PPP")
              )
            ) : (
              <span>Pick a date{isDateTime && " and time"}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
          />
          {isDateTime && (
            <div className="p-3 border-t space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Time
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="time"
                  value={timeValue}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  className="flex-1 text-sm"
                />
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
