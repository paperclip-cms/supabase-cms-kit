"use client";

import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { MoreVerticalIcon } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Tables } from "@/lib/supabase/types";
import { useState } from "react";

interface CollectionTableRowProps {
  item: Tables<"items">;
}

export function CollectionTableRow({ item }: CollectionTableRowProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const getStatusColor = (published_at: string | null) => {
    return published_at
      ? "bg-green-500/10 text-green-600 dark:text-green-400"
      : "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
  };

  const handleRowClick = () => {
    router.push(`${pathname}/${item.slug}`);
  };

  const handleEdit = () => {
    router.push(`${pathname}/${item.slug}`);
  };

  const handleDuplicate = () => {
    // TODO: Implement duplicate logic
    console.log("Duplicate:", item.slug);
  };

  const handleDelete = () => {
    // TODO: Implement delete logic
    console.log("Delete:", item.slug);
  };

  return (
    <div
      className={cn(
        "w-full flex items-center py-3 px-6 border-b border-muted-foreground/5 text-sm cursor-pointer group hover:bg-accent",
        isOpen && "bg-accent",
      )}
      onClick={handleRowClick}
    >
      {/* Mobile Layout */}
      <div className="md:hidden w-full flex items-center justify-between gap-3">
        {/* Left: Title + Date */}
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <span className="font-medium truncate">{item.title}</span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(item.updated_at, { addSuffix: true })}
          </span>
        </div>

        {/* Right: Status dot + Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Status Dot */}
          <div
            className={cn(
              "size-2 rounded-full",
              !!item.published_at && "bg-green-500",
              !item.published_at && "bg-yellow-500",
            )}
            title={item.published_at ? "Published" : "Draft"}
          />

          {/* Actions - always visible on mobile */}
          <DropdownMenu onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 focus-visible:ring-0 focus-visible:ring-offset-0"
              >
                <MoreVerticalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenuItem onClick={handleEdit}>Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={handleDuplicate}>
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} variant="destructive">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex md:w-full md:items-center">
        {/* Title */}
        <div className="w-[45%] xl:w-[50%] flex items-center gap-2">
          <div className="flex flex-col items-start overflow-hidden">
            <span className="font-medium truncate w-full">{item.title}</span>
          </div>
        </div>

        {/* Status */}
        <div className="w-[20%] xl:w-[15%] pl-2">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
              getStatusColor(item.published_at),
            )}
          >
            {item.published_at ? "Published" : "Draft"}
          </span>
        </div>

        {/* Created */}
        <div className="hidden xl:block xl:w-[17.5%] pl-2">
          <span className="text-muted-foreground">
            {formatDistanceToNow(item.created_at, { addSuffix: true })}
          </span>
        </div>

        {/* Updated */}
        <div className="w-[35%] xl:w-[17.5%] pl-2 flex items-center justify-between">
          <span className="text-muted-foreground">
            {formatDistanceToNow(item.updated_at, { addSuffix: true })}
          </span>

          {/* Actions Menu - visible on hover on desktop */}
          <div
            className={cn(
              "opacity-0 group-hover:opacity-100",
              isOpen && "opacity-100",
            )}
          >
            <DropdownMenu onOpenChange={setIsOpen}>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 focus-visible:ring-0 focus-visible:ring-offset-0"
                >
                  <MoreVerticalIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenuItem onClick={handleEdit}>Edit</DropdownMenuItem>
                <DropdownMenuItem onClick={handleDuplicate}>
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} variant="destructive">
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
