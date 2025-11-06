"use client";

import Link from "next/link";
import { useAuth } from "@/lib/contexts/auth-context";

export function HomeButtons() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex gap-4 justify-center pt-4">
        <div className="h-10 w-32 bg-accent/40 rounded-md animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex gap-4 justify-center pt-4">
      {user ? (
        <>
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
        </>
      ) : (
        <>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 px-6"
          >
            Log in
          </Link>
        </>
      )}
    </div>
  );
}
