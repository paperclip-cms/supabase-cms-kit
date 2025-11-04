import { PaperclipIcon } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-2xl text-center space-y-6">
        <div className="flex items-center justify-center gap-2">
          <PaperclipIcon className="h-8 w-8" />
          <h1 className="text-4xl font-bold">Paperclip OSS</h1>
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
