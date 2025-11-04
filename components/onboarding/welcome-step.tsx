"use client";

import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

type WelcomeStepProps = {
  onNext: () => void;
};

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple/10 mb-2">
          <Sparkles className="w-8 h-8 text-purple" />
        </div>
        <h1 className="text-3xl font-heading font-bold">
          Welcome to Paperclip CMS
        </h1>
        <p className="text-muted-foreground text-lg">
          A tiny, simple CMS built for Supabase
        </p>
      </div>

      <div className="bg-muted/50 rounded-lg p-6 space-y-4">
        <h2 className="font-heading text-lg font-semibold">
          What you'll need:
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
              <p className="font-medium">Your project's API keys</p>
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
                We'll guide you through the entire setup
              </p>
            </div>
          </li>
        </ul>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={onNext} className="bg-purple hover:bg-purple/90">
          Get Started
        </Button>
      </div>
    </div>
  );
}
