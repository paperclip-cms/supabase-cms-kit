"use client";

import * as React from "react";
import { DynamicIcon } from "lucide-react/dynamic";
import dynamicIconImports from "lucide-react/dynamicIconImports";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { slugify } from "../collections/new-collection-modal";

type IconName = keyof typeof dynamicIconImports;

const popularIcons: IconName[] = [
  "file-text",
  "file",
  "folder",
  "book-open",
  "newspaper",
  "image",
  "shopping-cart",
  "music",
  "star",
  "heart",
  "calendar",
  "package",
  "message-square",
  "mail",
  "lightbulb",
  "zap",
  "pencil",
  "camera",
];

const allIconNames = Object.keys(dynamicIconImports) as IconName[];

interface IconPickerProps {
  value: IconName;
  onChange: (icon: IconName) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [search, setSearch] = React.useState("");
  const [open, setOpen] = React.useState(false);

  const filteredIcons = React.useMemo(() => {
    if (!search) {
      return popularIcons;
    }

    const searchNormalizaed = slugify(search);

    return allIconNames
      .filter((name) => name.includes(searchNormalizaed))
      .sort((a, b) => {
        if (a === searchNormalizaed) return -1;
        if (b === searchNormalizaed) return 1;
        if (a.startsWith(searchNormalizaed) && !b.startsWith(searchNormalizaed))
          return -1;
        if (b.startsWith(searchNormalizaed) && !a.startsWith(searchNormalizaed))
          return 1;
        return a.localeCompare(b);
      });
  }, [search]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="justify-center size-9 p-0">
          <DynamicIcon name={value} className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-80">
        <div className="p-2 border-b">
          <input
            type="text"
            placeholder="Search icons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-2 py-1.5 text-sm border rounded-md outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="p-1">
          <div className="grid grid-cols-6 gap-1">
            {filteredIcons.slice(0, 18).map((iconName) => {
              return (
                <button
                  key={iconName}
                  onClick={() => {
                    onChange(iconName);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={cn(
                    "flex items-center justify-center p-2 rounded-md hover:bg-accent transition-colors",
                    value === iconName && "bg-accent",
                  )}
                  title={iconName}
                >
                  <DynamicIcon name={iconName} className="size-4" />
                </button>
              );
            })}
          </div>
          {filteredIcons.length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-8">
              No icons found
            </div>
          )}
        </div>
        <div className="p-2 border-t bg-muted/50">
          <p className="text-xs text-muted-foreground text-center">
            browse all icons at{" "}
            <a
              href="https://lucide.dev/icons"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              lucide.dev
            </a>
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
