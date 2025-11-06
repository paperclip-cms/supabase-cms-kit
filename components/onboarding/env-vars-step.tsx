"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Copy,
  ExternalLink,
  AlertCircle,
  Info,
  AlertTriangle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
          "Environment variables not detected. Please confirm, or try restarting your development.",
        );
      }
    } catch (err) {
      console.error(err);
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
        <h2 className="text-2xl font-heading font-bold">Connect to Supabase</h2>
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
            <div className="flex-1 space-y-2 flex-col">
              <p className="font-medium">Create a new Supabase project</p>
              <a
                href="https://supabase.com/dashboard/new/_"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-purple hover:underline"
              >
                Open Supabase
                <ExternalLink className="w-4 h-4" />
              </a>
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    title="Why do we need the service role key?"
                  >
                    <Info className="w-4 h-4" />
                    <span>Can I use an existing Supabase project?</span>
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      Can I use an existing Supabase project?
                    </DialogTitle>
                    <DialogDescription asChild>
                      <div className="space-y-3 text-left">
                        <p className="mt-2 ">
                          We{" "}
                          <span className="font-medium text-foreground">
                            strongly recommend
                          </span>{" "}
                          creating a new Supabase project specifically for your
                          CMS.
                        </p>
                        {/* <p>
                          Combining app data with CMS data can introduce issues like authentication{" "}
                          (CMS users vs. app users), scaling (app and CMS likely need to scale at different{" "}
                          rates), and more.
                        </p> */}
                        <p className="">
                          Combining app and CMS data can introduce concerns
                          with:
                        </p>
                        <ul className="space-y-2 list-disc list-inside">
                          <li>
                            <span className="font-medium text-foreground">
                              Authentication
                            </span>{" "}
                            - CMS users vs. app users
                          </li>
                          <li>
                            <span className="font-medium text-foreground">
                              Scaling
                            </span>{" "}
                            - CMS and app likely need to scale at different
                            rates
                          </li>
                        </ul>
                        <p>
                          Your CMS will probably be completely fine on the
                          Supabase free tier for a long time. Should you need to
                          scale beyond this, consider the{" "}
                          <a
                            href="https://github.com/paperclip-cms/supabase-cms-kit/blob/main/MANUAL_SETUP.md"
                            className="inline-flex items-center gap-1 text-sm text-purple hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            hosted version of Paperclip
                            <ExternalLink className="w-4 h-4" />
                          </a>{" "}
                          for just $10/mo.
                        </p>
                        <div className="bg-muted/50 rounded-md p-3 mt-4">
                          <p className="text-sm font-medium text-foreground mb-2">
                            Still want to use an existing Supabase project?
                          </p>
                          <p className="text-sm mb-4">
                            Just use the API keys &amp; URL from your existing
                            project. However, it&apos;s up to you to manage the
                            DB tables and authentication setup.
                          </p>
                          <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                            <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                            <p className="text-sm font-medium text-destructive">
                              If you use an existing project the setup wizard
                              will not work, and the migrations will probably
                              break things.
                            </p>
                          </div>
                        </div>
                      </div>
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-purple/20 text-purple flex items-center justify-center flex-shrink-0 mt-0.5 text-sm font-semibold">
              2
            </div>
            <div className="flex-1 space-y-2">
              <p className="font-medium">Get your Project URL &amp; API keys</p>
              <p className="text-sm text-muted-foreground">
                Go to Project Settings in your Supabase dashboard
              </p>
              <div className="flex flex-col">
                <a
                  href="https://supabase.com/dashboard/project/_/settings/api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-purple hover:underline"
                >
                  Open API Settings for Project URL
                  <ExternalLink className="w-4 h-4" />
                </a>
                <a
                  href="https://supabase.com/dashboard/project/_/settings/api-keys/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-purple hover:underline"
                >
                  Create new API Keys
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-purple/20 text-purple flex items-center justify-center flex-shrink-0 mt-0.5 text-sm font-semibold">
              3
            </div>
            <div className="flex-1 space-y-3">
              <p className="font-medium">
                Create a <code>.env</code> file
              </p>
              <p className="text-sm text-muted-foreground">
                Copy the <code>.env.example</code> file into a new{" "}
                <code>.env</code> file:
              </p>
              <div className="relative">
                <pre className="bg-background border rounded-md p-3 text-xs overflow-x-auto">
                  {`cp .env.example .env`}
                </pre>
                <button
                  onClick={() => copyToClipboard(`cp .env.example .env`)}
                  className="absolute top-1/2 -translate-y-1/2 right-2 p-1.5 rounded-md bg-muted hover:bg-muted/80 transition-colors"
                  title="Copy to clipboard"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground">
                Fill in the values with your URL &amp; API Keys from Supabase:
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
                  className="absolute top-2 right-2 p-1.5 rounded-md bg-muted hover:bg-muted/80 transition-colors"
                  title="Copy to clipboard"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    title="Why do we need the service role key?"
                  >
                    <Info className="w-4 h-4" />
                    <span>Why do we need the service role key?</span>
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      Why do we need the service role key?
                    </DialogTitle>
                    <DialogDescription asChild>
                      <div className="space-y-3 text-left">
                        <p>
                          Generally speaking, you should try to avoid use of the
                          service role key when possible. It bypasses RLS
                          policies in your Supabase database, and is therefore
                          dangerous to expose to clients.
                        </p>
                        <p className="font-medium text-foreground">
                          Paperclip OSS uses this key for:
                        </p>
                        <ul className="space-y-2 list-disc list-inside">
                          <li>Checking your setup progress</li>
                          <li>Creating the first admin user</li>
                        </ul>
                        <p>
                          Your service role key is only stored on your machine,
                          never sent anywhere, and only used for the operations
                          listed above.
                        </p>
                        <div className="bg-muted/50 rounded-md p-3 mt-4">
                          <p className="text-sm font-medium text-foreground mb-2">
                            Don&apos;t feel comfortable using this key?
                          </p>
                          <p className="text-sm mb-4">
                            Feel free to revoke this key and/or remove it from
                            your <code>.env</code> file after you&apos;ve
                            finished creating your first user.
                          </p>
                          <p className="text-sm">
                            If you don&apos;t want to use this key at all, see{" "}
                            <a
                              href="https://github.com/paperclip-cms/supabase-cms-kit/blob/main/MANUAL_SETUP.md"
                              className="inline-flex items-center gap-1 text-sm text-purple hover:underline"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <code>MANUAL_SETUP.md</code>
                              <ExternalLink className="w-4 h-4" />
                            </a>{" "}
                            for manual setup instructions. Keep in mind the
                            setup wizard will not work properly during manual
                            setup.
                          </p>
                        </div>
                      </div>
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-purple/20 text-purple flex items-center justify-center flex-shrink-0 mt-0.5 text-sm font-semibold">
              4
            </div>
            <div className="flex-1 space-y-2">
              <p className="font-medium">Restart your development server (if needed)</p>
              <p className="text-sm text-muted-foreground">
                This page should automatically refresh once you save your changes{" "}
                to the <code>.env</code> file. If not, stop your server (<code>Ctrl+C</code>){" "}
                and run <code>npm run dev</code> again.
              </p>
            </div>
          </div>
        </div> */}
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
