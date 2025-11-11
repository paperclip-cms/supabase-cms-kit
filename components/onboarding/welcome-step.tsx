"use client";

import { Button } from "@/components/ui/button";
import { LogoWithBadge } from "@/components/branding/logo-with-badge";
import { Zap, ExternalLink, Info } from "lucide-react";
import { useOnboarding } from "@/lib/contexts/onboarding-context";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type WelcomeStepProps = {
  onNext: () => void;
};

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  const { telemetryEnabled, setTelemetryEnabled } = useOnboarding();

  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <LogoWithBadge size="sm" className="justify-center mb-2" />
        {/* <h1 className="text-3xl font-heading font-bold">
          Welcome to Paperclip
        </h1> */}
        <p className="text-muted-foreground text-lg">
          a tiny, simple open-source CMS for Supabase
        </p>
      </div>

      <div className="bg-muted/50 rounded-lg p-6 space-y-4">
        <h2 className="font-heading text-lg font-semibold">
          What you&apos;ll need:
        </h2>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-purple/20 text-purple flex items-center justify-center flex-shrink-0 mt-0.5 text-sm font-semibold">
              1
            </div>
            <div>
              <p className="font-medium">A Supabase project</p>
              <p className="text-sm text-muted-foreground">
                Create one at{" "}
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple hover:underline"
                >
                  supabase.com/dashboard
                </a>
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-purple/20 text-purple flex items-center justify-center flex-shrink-0 mt-0.5 text-sm font-semibold">
              2
            </div>
            <div>
              <p className="font-medium">Your project&apos;s API keys</p>
              <p className="text-sm text-muted-foreground">
                Found in Project Settings → API
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-purple/20 text-purple flex items-center justify-center flex-shrink-0 mt-0.5 text-sm font-semibold">
              3
            </div>
            <div>
              <p className="font-medium">About 5 minutes</p>
              <p className="text-sm text-muted-foreground">
                We&apos;ll guide you through the entire setup
              </p>
            </div>
          </li>
        </ul>
      </div>

      {/* Hosted CTA */}
      {/* <a
        href="https://paperclip.dev?source=oss-onboarding"
        target="_blank"
        rel="noopener noreferrer"
        className="block border border-purple/20 rounded-lg p-4 bg-purple/5 hover:bg-purple/10 hover:border-purple/30 transition-colors group"
      >
        <div className="flex items-start gap-3">
          <Zap className="w-5 h-5 text-purple flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium mb-1">
              Want more features with zero setup?
            </p>
            <p className="text-sm text-muted-foreground">
              Unlimited everything, plus extra features - get started in &lt;60
              seconds for just $10/mo.
            </p>
          </div>
          <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-purple flex-shrink-0 mt-0.5 transition-colors" />
        </div>
      </a> */}

      {/* Telemetry Opt-in */}
      <div className="border-t pt-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  title="What data do we collect?"
                >
                  <Info className="w-4 h-4" />
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>What data do we collect?</DialogTitle>
                  <DialogDescription asChild>
                    <div className="space-y-3 text-left">
                      <p className="mt-2">
                        With your consent, we use PostHog to collect anonymous{" "}
                        usage data to help improve Paperclip. This includes:
                      </p>
                      <ul className="space-y-2 list-disc list-inside">
                        <li>Feature usage patterns (what features you use)</li>
                        <li>Error messages and stack traces</li>
                        <li>Performance metrics</li>
                        <li>General system information (OS, browser)</li>
                      </ul>
                      <p className="font-medium text-foreground">
                        We never collect:
                      </p>
                      <ul className="space-y-2 list-disc list-inside">
                        <li>Your content or data</li>
                        <li>Personal information</li>
                        <li>API keys or credentials</li>
                        <li>IP addresses</li>
                      </ul>
                      <div className="bg-muted/50 rounded-md p-3 mt-4">
                        <p className="text-sm">
                          You can change this setting anytime from the settings
                          page. For more details,{" "}
                          <a
                            href="https://github.com/search?q=repo%3Apaperclip-cms%2Fsupabase-cms-kit+posthog.capture&type=code"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple hover:underline inline-flex items-center gap-1"
                          >
                            search <code>posthog.capture</code>
                            <ExternalLink className="w-3 h-3" />
                          </a>{" "}
                          to see all events we collect.
                        </p>
                      </div>
                    </div>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
            <div>
              <label
                htmlFor="telemetry"
                className="text-sm font-medium cursor-pointer"
              >
                Anonymous telemetry
              </label>
              <p className="text-xs text-muted-foreground">
                Help us improve Paperclip
              </p>
            </div>
          </div>
          <Switch
            id="telemetry"
            checked={telemetryEnabled}
            onCheckedChange={setTelemetryEnabled}
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={onNext} className="bg-purple hover:bg-purple/90">
          Get Started
        </Button>
      </div>
    </div>
  );
}
