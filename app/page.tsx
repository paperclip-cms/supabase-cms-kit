"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useOnboarding } from "@/lib/contexts/onboarding-context";

export default function Home() {
  const router = useRouter();
  const { status, isLoading } = useOnboarding();

  React.useEffect(() => {
    if (!isLoading && status && !status.complete) {
      router.push("/onboarding");
    }
  }, [status, isLoading, router]);

  if (isLoading || (status && !status.complete)) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple/20 border-t-purple rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-2xl text-center space-y-6">
        <div className="flex items-center justify-center gap-3">
          <Image
            src="/brand/paperclip_logo.svg"
            alt="Paperclip"
            width={180}
            height={36}
            className="h-10 w-auto dark:hidden"
            priority
          />
          <Image
            src="/brand/paperclip_logo_white.svg"
            alt="Paperclip"
            width={180}
            height={36}
            className="h-10 w-auto hidden dark:block"
            priority
          />
          <span className="text-[11px] font-mono font-semibold px-2 py-1 bg-accent/80 dark:bg-accent/40 text-foreground border border-border tracking-wider">
            OSS
          </span>
        </div>
        <p className="text-muted-foreground text-lg">
          a tiny, simple CMS UI &amp; API layer for Supabase
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Link
            href="/collections"
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 px-6"
          >
            View Collections
          </Link>
          <Link
            href="/settings"
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-10 px-6"
          >
            Settings
          </Link>
        </div>
      </div>
    </div>
  );
}
