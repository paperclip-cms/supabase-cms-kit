"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CogIcon, FolderIcon, NotebookIcon, LogOut } from "lucide-react";
import { useAuth } from "@/lib/contexts/auth-context";

export default function NavPage() {
  const router = useRouter();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
      <Link
        href="/collections"
        className="w-full max-w-sm flex items-stretch rounded-lg border border-border bg-background hover:bg-accent transition-colors overflow-hidden group"
      >
        <div className="flex items-center justify-center w-16 bg-muted/50 border-r border-border group-hover:bg-muted transition-colors">
          <FolderIcon className="w-5 h-5" />
        </div>
        <div className="flex-1 flex items-center justify-center py-6 text-lg font-medium font-heading">
          Collections
        </div>
      </Link>
      <Link
        href="/settings"
        className="w-full max-w-sm flex items-stretch rounded-lg border border-border bg-background hover:bg-accent transition-colors overflow-hidden group"
      >
        <div className="flex items-center justify-center w-16 bg-muted/50 border-r border-border group-hover:bg-muted transition-colors">
          <CogIcon className="w-5 h-5" />
        </div>
        <div className="flex-1 flex items-center justify-center py-6 text-lg font-medium font-heading">
          Settings
        </div>
      </Link>
      <Link
        href="/docs"
        className="w-full max-w-sm flex items-stretch rounded-lg border border-border bg-background hover:bg-accent transition-colors overflow-hidden group"
      >
        <div className="flex items-center justify-center w-16 bg-muted/50 border-r border-border group-hover:bg-muted transition-colors">
          <NotebookIcon className="w-5 h-5" />
        </div>
        <div className="flex-1 flex items-center justify-center py-6 text-lg font-medium font-heading">
          Docs
        </div>
      </Link>
      <button
        onClick={handleSignOut}
        className="mt-6 flex items-center gap-2 px-4 py-2 rounded-md border border-destructive/20 bg-background text-destructive hover:bg-destructive/10 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        <span className="text-sm font-medium">Sign out</span>
      </button>
    </div>
  );
}
