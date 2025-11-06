"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Copy,
  ExternalLink,
  AlertCircle,
  Loader2,
} from "lucide-react";

type MigrationsStepProps = {
  onNext: () => void;
  isComplete: boolean;
};

export function MigrationsStep({ onNext, isComplete }: MigrationsStepProps) {
  const [isChecking, setIsChecking] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleCheck = async () => {
    setIsChecking(true);
    setError(null);

    try {
      const response = await fetch("/api/onboarding/status");
      const data = await response.json();

      if (data.migrationsRun) {
        onNext();
      } else {
        setError(
          "Database tables not detected. Please make sure you've run the migrations successfully.",
        );
      }
    } catch (err) {
      console.error(err);
      setError("Failed to check migrations. Please try again.");
    } finally {
      setIsChecking(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (isComplete) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple/10 mb-2">
            <CheckCircle2 className="w-6 h-6 text-purple" />
          </div>
          <h2 className="text-2xl font-heading font-bold">
            Database Configured
          </h2>
          <p className="text-muted-foreground">
            Your database tables are set up and ready
          </p>
        </div>
        <div className="flex justify-end pt-4">
          <Button onClick={onNext} className="bg-purple hover:bg-purple/90">
            Continue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-heading font-bold">
          Run Database Migrations
        </h2>
        <p className="text-muted-foreground">
          Set up the database schema for your CMS
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-purple/20 text-purple flex items-center justify-center flex-shrink-0 mt-0.5 text-sm font-semibold">
              1
            </div>
            <div className="flex-1 space-y-3">
              <p className="font-medium">Log in to the Supabase CLI</p>
              <p className="text-sm text-muted-foreground">
                Run the following command in your terminal:
              </p>
              <div className="relative">
                <pre className="bg-background border rounded-md p-3 text-xs overflow-x-auto">
                  npx supabase login
                </pre>
                <button
                  onClick={() => copyToClipboard("npx supabase login")}
                  className="absolute top-1/2 -translate-y-1/2 right-2 p-1.5 rounded-md bg-muted hover:bg-muted/80 transition-colors"
                  title="Copy to clipboard"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-purple/20 text-purple flex items-center justify-center flex-shrink-0 mt-0.5 text-sm font-semibold">
              2
            </div>
            <div className="flex-1 space-y-3">
              <p className="font-medium">Link your local project to Supabase</p>
              <p className="text-sm text-muted-foreground">
                Run the following command in your terminal:
              </p>
              <div className="relative">
                <pre className="bg-background border rounded-md p-3 text-xs overflow-x-auto">
                  npx supabase link
                </pre>
                <button
                  onClick={() => copyToClipboard("npx supabase link")}
                  className="absolute top-1/2 -translate-y-1/2 right-2 p-1.5 rounded-md bg-muted hover:bg-muted/80 transition-colors"
                  title="Copy to clipboard"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground">
                You&apos;ll need your project reference ID from the{" "}
                <a
                  href="https://supabase.com/dashboard/project/_/settings/api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-purple hover:underline"
                >
                  Supabase dashboard
                  <ExternalLink className="w-4 h-4" />
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-purple/20 text-purple flex items-center justify-center flex-shrink-0 mt-0.5 text-sm font-semibold">
              3
            </div>
            <div className="flex-1 space-y-3">
              <p className="font-medium">Push migrations to your database</p>
              <p className="text-sm text-muted-foreground">
                Run the following command:
              </p>
              <div className="relative">
                <pre className="bg-background border rounded-md p-3 text-xs overflow-x-auto">
                  npx supabase db push
                </pre>
                <button
                  onClick={() => copyToClipboard("npx supabase db push")}
                  className="absolute top-1/2 -translate-y-1/2 right-2 p-1.5 rounded-md bg-muted hover:bg-muted/80 transition-colors"
                  title="Copy to clipboard"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground">
                This will create the <code>collections</code>,{" "}
                <code>items</code>, and <code>profiles</code> tables, along with
                some required functions and indexes. See the{" "}
                <a
                  href="https://github.com/paperclip-cms/supabase-cms-kit/tree/main/supabase/migrations"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-purple hover:underline"
                >
                  migrations files
                  <ExternalLink className="w-4 h-4" />
                </a>{" "}
                for more info.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-purple/20 text-purple flex items-center justify-center flex-shrink-0 mt-0.5 text-sm font-semibold">
              4
            </div>
            <div className="flex-1 space-y-3">
              <p className="font-medium">Push Supabase config</p>
              <p className="text-sm text-muted-foreground">
                Run the following command in your terminal:
              </p>
              <div className="relative">
                <pre className="bg-background border rounded-md p-3 text-xs overflow-x-auto">
                  npx supabase config push
                </pre>
                <button
                  onClick={() => copyToClipboard("npx supabase config push")}
                  className="absolute top-1/2 -translate-y-1/2 right-2 p-1.5 rounded-md bg-muted hover:bg-muted/80 transition-colors"
                  title="Copy to clipboard"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-purple/10 border border-purple/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-purple/20 text-purple flex items-center justify-center flex-shrink-0 text-xs font-bold">
              ?
            </div>
            <div className="space-y-2">
              <p className="font-medium text-sm">Need help?</p>
              <p className="text-sm text-muted-foreground">
                Check out the{" "}
                <a
                  href="https://supabase.com/docs/guides/cli/getting-started"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple hover:underline inline-flex items-center gap-1"
                >
                  Supabase CLI documentation
                  <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4">
        <Button
          onClick={handleCheck}
          disabled={isChecking}
          className="bg-purple hover:bg-purple/90"
        >
          {isChecking ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Checking...
            </>
          ) : (
            "Continue"
          )}
        </Button>
      </div>
    </div>
  );
}
