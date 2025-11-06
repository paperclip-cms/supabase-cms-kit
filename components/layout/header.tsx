"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/contexts/auth-context";
import { useOnboarding } from "@/lib/contexts/onboarding-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "./theme-toggle";
import { ChevronDownIcon, MenuIcon } from "lucide-react";
import { collections } from "@/lib/mock-data";
import { LogoWithBadge } from "@/components/branding/logo-with-badge";

export default function Header() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { status } = useOnboarding();
  const onboardingComplete = status?.complete ?? true;
  const showNav = user && onboardingComplete;

  const navContent = (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "gap-1",
              pathname.startsWith("/collections") && "bg-accent",
            )}
          >
            Collections
            <ChevronDownIcon className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {collections.map((collection) => (
            <DropdownMenuItem key={collection.id} asChild>
              <Link href={`/collections/${collection.id}`}>
                {collection.name}
              </Link>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/collections">All Collections</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="ghost"
        size="sm"
        className={cn(pathname === "/settings" && "bg-accent")}
        asChild
      >
        <Link href="/settings">Settings</Link>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className={cn(pathname === "/docs" && "bg-accent")}
        asChild
      >
        <Link href="/docs">Docs</Link>
      </Button>
    </>
  );

  return (
    <div className="w-full flex justify-between items-center border-b border-b-gray-400 dark:border-b-border h-14 px-6 bg-secondary/30 dark:bg-muted/50 relative z-50">
      {/* Left: Logo + Nav */}
      <div className="flex items-center gap-6">
        <Link href="/">
          <LogoWithBadge size="sm" priority />
        </Link>

        {/* Desktop Nav */}
        {showNav && (
          <nav className="hidden md:flex items-center gap-1">{navContent}</nav>
        )}
      </div>

      {/* Right: Theme toggle + Mobile Menu */}
      <div className="flex items-center gap-2">
        <ThemeToggle />

        {/* Mobile Menu Button */}
        {showNav && (
          <Button variant="ghost" size="icon" className="md:hidden" asChild>
            <Link href="/nav">
              <MenuIcon className="h-5 w-5" />
              <span className="sr-only">Navigation</span>
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
