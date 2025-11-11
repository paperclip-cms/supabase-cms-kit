import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  currentPage: string;
  backHref?: string;
  className?: string;
}

export function Breadcrumb({
  items,
  currentPage,
  backHref,
  className,
}: BreadcrumbProps) {
  const backLink =
    backHref || (items.length > 0 ? items[items.length - 1].href : "/");

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {/* Mobile breadcrumb - text style */}
      <div className="md:hidden flex items-center gap-1.5 text-xs text-muted-foreground">
        {items.map((item) => (
          <div key={item.href} className="flex items-center gap-1.5">
            <Link
              href={item.href}
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
            <span>/</span>
          </div>
        ))}
        <span className="text-foreground">{currentPage}</span>
      </div>

      {/* Title row with navigation */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Mobile: Back arrow */}
          <Link href={backLink} className="md:hidden shrink-0">
            <ArrowLeftIcon className="size-6" />
          </Link>

          {/* Desktop: Full breadcrumb with large text */}
          {items.map((item) => (
            <div
              key={item.href}
              className="hidden md:flex items-center gap-3 shrink-0"
            >
              <Link
                href={item.href}
                className="text-3xl font-bold font-heading text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
              <span className="text-3xl font-bold font-heading text-muted-foreground">
                /
              </span>
            </div>
          ))}

          {/* Current page title */}
          <h1 className="text-3xl font-bold font-heading truncate">
            {currentPage}
          </h1>
        </div>
      </div>
    </div>
  );
}
