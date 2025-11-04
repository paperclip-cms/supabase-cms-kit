"use client";

import * as React from "react";
import { CollectionEntry } from "@/lib/mock-data";
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

interface CollectionTableRowProps {
  entry: CollectionEntry;
}

export function CollectionTableRow({ entry }: CollectionTableRowProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  const getStatusColor = (status: CollectionEntry["status"]) => {
    switch (status) {
      case "published":
        return "bg-green-500/10 text-green-600 dark:text-green-400";
      case "draft":
        return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
      case "archived":
        return "bg-gray-500/10 text-gray-600 dark:text-gray-400";
    }
  };

  const handleRowClick = () => {
    router.push(`${pathname}/${entry.id}`);
  };

  const handleEdit = () => {
    router.push(`${pathname}/${entry.id}`);
  };

  const handleDuplicate = () => {
    // TODO: Implement duplicate logic
    console.log("Duplicate:", entry.id);
  };

  const handleDelete = () => {
    // TODO: Implement delete logic
    console.log("Delete:", entry.id);
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
          <span className="font-medium truncate">{entry.title}</span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(entry.updatedAt, { addSuffix: true })}
          </span>
        </div>

        {/* Right: Status dot + Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Status Dot */}
          <div
            className={cn(
              "size-2 rounded-full",
              entry.status === "published" && "bg-green-500",
              entry.status === "draft" && "bg-yellow-500",
              entry.status === "archived" && "bg-gray-500",
            )}
            title={entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
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
            <span className="font-medium truncate w-full">{entry.title}</span>
          </div>
        </div>

        {/* Status */}
        <div className="w-[20%] xl:w-[15%] pl-2">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
              getStatusColor(entry.status),
            )}
          >
            {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
          </span>
        </div>

        {/* Created */}
        <div className="hidden xl:block xl:w-[17.5%] pl-2">
          <span className="text-muted-foreground">
            {formatDistanceToNow(entry.createdAt, { addSuffix: true })}
          </span>
        </div>

        {/* Updated */}
        <div className="w-[35%] xl:w-[17.5%] pl-2 flex items-center justify-between">
          <span className="text-muted-foreground">
            {formatDistanceToNow(entry.updatedAt, { addSuffix: true })}
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
