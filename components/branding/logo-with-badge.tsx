import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoWithBadgeProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
  priority?: boolean;
};

const sizeConfig = {
  sm: {
    logoHeight: 24,
    logoWidth: 120,
    logoClassName: "h-6 w-auto",
    badgeClassName: "text-[9px] px-1.5 py-0.5",
  },
  md: {
    logoHeight: 30,
    logoWidth: 150,
    logoClassName: "h-[30px] w-auto",
    badgeClassName: "text-[10px] px-1.5 py-0.5",
  },
  lg: {
    logoHeight: 40,
    logoWidth: 180,
    logoClassName: "h-10 w-auto",
    badgeClassName: "text-[11px] px-2 py-1",
  },
};

export function LogoWithBadge({
  size = "sm",
  className,
  priority = false,
}: LogoWithBadgeProps) {
  const config = sizeConfig[size];

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <Image
        src="/brand/paperclip_logo.svg"
        alt="Paperclip"
        width={config.logoWidth}
        height={config.logoHeight}
        className={cn(config.logoClassName, "dark:hidden")}
        priority={priority}
      />
      <Image
        src="/brand/paperclip_logo_white.svg"
        alt="Paperclip"
        width={config.logoWidth}
        height={config.logoHeight}
        className={cn(config.logoClassName, "hidden dark:block")}
        priority={priority}
      />
      <span
        className={cn(
          "font-mono font-semibold bg-accent/80 dark:bg-accent/40 text-foreground border border-border tracking-wider",
          config.badgeClassName,
        )}
      >
        OSS
      </span>
    </div>
  );
}
