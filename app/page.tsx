"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { useOnboarding } from "@/lib/contexts/onboarding-context";
import { HomeButtons } from "@/components/home-buttons";
import { LogoWithBadge } from "@/components/branding/logo-with-badge";

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
      <div className="min-h-full flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple/20 border-t-purple rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-full flex-1 flex items-center justify-center p-8">
      <div className="max-w-2xl text-center space-y-6">
        <LogoWithBadge size="lg" className="justify-center" priority />
        <p className="text-muted-foreground text-lg">
          a tiny, simple CMS UI &amp; API layer for Supabase
        </p>
        <HomeButtons />
      </div>
    </div>
  );
}
