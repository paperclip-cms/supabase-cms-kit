"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Copy, ExternalLink, AlertCircle } from "lucide-react";

type EnvVarsStepProps = {
  onNext: () => void;
  isComplete: boolean;
};

export function EnvVarsStep({ onNext, isComplete }: EnvVarsStepProps) {
  const [isChecking, setIsChecking] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleCheck = async () => {
    setIsChecking(true);
    setError(null);

    try {
      const response = await fetch("/api/onboarding/status");
      const data = await response.json();

      if (data.envVarsSet) {
        onNext();
      } else {
        setError(
          "Environment variables not detected. Please restart your development server after updating the .env file.",
        );
      }
    } catch (err) {
      setError("Failed to check environment variables. Please try again.");
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
            Environment Variables Set
          </h2>
          <p className="text-muted-foreground">
            Your Supabase connection is configured
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
          Connect to Supabase
        </h2>
        <p className="text-muted-foreground">
          Set up your environment variables to connect to your Supabase project
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-purple/20 text-purple flex items-center justify-center flex-shrink-0 mt-0.5 text-sm font-semibold">
              1
            </div>
            <div className="flex-1 space-y-2">
              <p className="font-medium">
                Create a Supabase project (if you haven't already)
              </p>
              <a
                href="https://supabase.com/dashboard/new"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-purple hover:underline"
              >
                Open Supabase Dashboard
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-purple/20 text-purple flex items-center justify-center flex-shrink-0 mt-0.5 text-sm font-semibold">
              2
            </div>
            <div className="flex-1 space-y-2">
              <p className="font-medium">Get your API keys</p>
              <p className="text-sm text-muted-foreground">
                Go to Project Settings → API in your Supabase dashboard
              </p>
              <a
                href="https://supabase.com/dashboard/project/_/settings/api"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-purple hover:underline"
              >
                Open API Settings
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-purple/20 text-purple flex items-center justify-center flex-shrink-0 mt-0.5 text-sm font-semibold">
              3
            </div>
            <div className="flex-1 space-y-3">
              <p className="font-medium">Create a .env file</p>
              <p className="text-sm text-muted-foreground">
                In your project root, create a <code>.env</code> file with the
                following:
              </p>
              <div className="relative">
                <pre className="bg-background border rounded-md p-3 text-xs overflow-x-auto">
                  {`NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key`}
                </pre>
                <button
                  onClick={() =>
                    copyToClipboard(
                      `NEXT_PUBLIC_SUPABASE_URL=your-project-url\nNEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key\nSUPABASE_SERVICE_ROLE_KEY=your-service-role-key`,
                    )
                  }
                  className="absolute top-2 right-2 p-2 rounded-md bg-muted hover:bg-muted/80 transition-colors"
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
              4
            </div>
            <div className="flex-1 space-y-2">
              <p className="font-medium">Restart your development server</p>
              <p className="text-sm text-muted-foreground">
                Stop your server (Ctrl+C) and run <code>npm run dev</code>{" "}
                again
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
          {isChecking ? "Checking..." : "Continue"}
        </Button>
      </div>
    </div>
  );
}
