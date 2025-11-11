import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FieldRowProps {
  label: string;
  required?: boolean;
  hidden?: boolean;
  children: ReactNode;
  className?: string;
}

export function FieldRow({
  label,
  required = false,
  hidden = false,
  children,
  className,
}: FieldRowProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-4",
        hidden && "opacity-60 hover:opacity-100 transition-opacity",
        className,
      )}
    >
      <label className="text-sm font-medium text-muted-foreground min-w-[80px] pt-2">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      <div className="flex-1 max-w-md">{children}</div>
    </div>
  );
}
