"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { useOnboarding } from "@/lib/contexts/onboarding-context";
import { useEffect } from "react";

type CompleteStepProps = {
  onComplete: () => void;
};

export function CompleteStep({ onComplete }: CompleteStepProps) {
  const { telemetryEnabled } = useOnboarding();

  // Persist telemetry preference to database when component loads
  useEffect(() => {
    const persistTelemetry = async () => {
      try {
        await fetch("/api/settings/telemetry", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ enabled: telemetryEnabled }),
        });
        // Clear localStorage after successful DB write
        localStorage.removeItem("paperclip_oss_telemetry_preference");
      } catch (error) {
        console.error("Failed to persist telemetry preference:", error);
      }
    };

    persistTelemetry();
  }, [telemetryEnabled]);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple/10 mb-2">
          <CheckCircle2 className="w-8 h-8 text-purple" />
        </div>
        <h1 className="text-3xl font-heading font-bold">
          You&apos;re All Set!
        </h1>
        <p className="text-muted-foreground text-lg">
          Paperclip CMS is ready to use
        </p>
      </div>

      <div className="bg-gradient-to-br from-purple/10 to-purple/5 rounded-lg p-6 space-y-4 border border-purple/20">
        <h2 className="font-heading text-lg font-semibold">Next steps:</h2>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-purple/20 text-purple flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="font-medium">Create your first collection</p>
              <p className="text-sm text-muted-foreground">
                Define a content type like &quot;Blog Posts&quot; or
                &quot;Pages&quot;
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-purple/20 text-purple flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="font-medium">Add your first content</p>
              <p className="text-sm text-muted-foreground">
                Start creating entries in your collection
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-purple/20 text-purple flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="font-medium">Integrate with your frontend</p>
              <p className="text-sm text-muted-foreground">
                Use Supabase client to fetch content in your app
              </p>
            </div>
          </li>
        </ul>
      </div>

      <div className="flex justify-end pt-4">
        <Button
          onClick={onComplete}
          className="bg-purple hover:bg-purple/90 gap-2"
        >
          Go to Collections
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
