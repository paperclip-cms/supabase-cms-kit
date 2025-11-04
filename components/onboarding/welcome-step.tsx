"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Zap, ExternalLink } from "lucide-react";

type WelcomeStepProps = {
  onNext: () => void;
};

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center gap-2 mb-2">
          <Image
            src="/brand/paperclip_logo.svg"
            alt="Paperclip"
            width={120}
            height={24}
            className="h-6 w-auto dark:hidden"
          />
          <Image
            src="/brand/paperclip_logo_white.svg"
            alt="Paperclip"
            width={120}
            height={24}
            className="h-6 w-auto hidden dark:block"
          />
          <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 bg-accent/80 dark:bg-accent/40 text-foreground border border-border tracking-wider">
            OSS
          </span>
        </div>
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
      <a
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
              Unlimited everything, plus extra features - get started in &lt;60 seconds for just $10/mo.
            </p>
          </div>
          <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-purple flex-shrink-0 mt-0.5 transition-colors" />
        </div>
      </a>

      <div className="flex justify-end pt-4">
        <Button onClick={onNext} className="bg-purple hover:bg-purple/90">
          Get Started
        </Button>
      </div>
    </div>
  );
}
