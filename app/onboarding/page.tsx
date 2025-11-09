"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Circle, AlertTriangle, X } from "lucide-react";
import { useOnboarding } from "@/lib/contexts/onboarding-context";
import { EnvVarsStep } from "@/components/onboarding/env-vars-step";
import { MigrationsStep } from "@/components/onboarding/migrations-step";
import { FirstUserStep } from "@/components/onboarding/first-user-step";
import { WelcomeStep } from "@/components/onboarding/welcome-step";
import { CompleteStep } from "@/components/onboarding/complete-step";
import React from "react";

type Step = {
  id: string;
  title: string;
  description: string;
};

const steps: Step[] = [
  {
    id: "welcome",
    title: "Welcome",
    description: "Get started with Paperclip CMS",
  },
  {
    id: "env_vars",
    title: "Environment Setup",
    description: "Connect to your Supabase project",
  },
  {
    id: "migrations",
    title: "Database Migrations",
    description: "Run database migrations",
  },
  {
    id: "create_user",
    title: "Create First User",
    description: "Set up your admin account",
  },
  {
    id: "complete",
    title: "Complete",
    description: "You're all set!",
  },
];

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status, isLoading, refetch } = useOnboarding();
  const [currentStep, setCurrentStep] = useState<string>("welcome");
  const [showBanner, setShowBanner] = useState(false);
  const [hasMissingEnvVarsError, setHasMissingEnvVarsError] = useState(false);

  // Capture the error state and clear the query param
  useEffect(() => {
    const hasError = searchParams.get("error") === "missing-env-vars";
    if (hasError) {
      setHasMissingEnvVarsError(true);
      setShowBanner(true);
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("error");
      router.replace(newUrl.pathname + newUrl.search);
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (status) {
      if (status.complete) {
        setCurrentStep("complete");
      } else if (status.step) {
        setCurrentStep(status.step);
      }
    }
  }, [status]);

  const handleNext = async () => {
    await refetch();
  };

  const handleComplete = () => {
    router.push("/collections");
  };

  const getStepStatus = (stepId: string) => {
    if (!status) return "pending";

    const stepOrder = [
      "welcome",
      "env_vars",
      "migrations",
      "create_user",
      "complete",
    ];
    const currentIndex = stepOrder.indexOf(currentStep);
    const stepIndex = stepOrder.indexOf(stepId);

    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "current";
    return "pending";
  };

  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple/20 border-t-purple rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col bg-muted/30">
      {/* Main Content */}
      <main className="flex-1 container max-w-5xl mx-auto px-6 py-12">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {steps.map((step, index) => {
              const stepStatus = getStepStatus(step.id);
              const isLast = index === steps.length - 1;

              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`
                        flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all
                        ${
                          stepStatus === "completed"
                            ? "bg-purple border-purple text-purple-foreground"
                            : stepStatus === "current"
                              ? "border-purple text-purple"
                              : "border-muted-foreground/30 text-muted-foreground"
                        }
                      `}
                    >
                      {stepStatus === "completed" ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </div>
                    <div className="text-center hidden md:block">
                      <p
                        className={`text-sm font-medium ${
                          stepStatus === "current"
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {step.title}
                      </p>
                    </div>
                  </div>
                  {!isLast && (
                    <div
                      className={`flex-1 h-0.5 mx-2 transition-colors ${
                        stepStatus === "completed"
                          ? "bg-purple"
                          : "bg-muted-foreground/20"
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-2xl mx-auto">
          {/* TODO: extract out this query-param-error logic, this is ugly */}
          {hasMissingEnvVarsError && showBanner && (
            <div className="mb-6 border rounded-lg bg-destructive/10 border-destructive/20 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-destructive mb-1">
                    Did you forget environment variables?
                  </p>
                  <p className="text-sm text-destructive/90 mb-2">
                    Make sure you have set these in your <code>.env</code> file
                    or hosting provider:
                  </p>
                  <ul className="space-y-1 list-['-_'] list-inside text-sm mb-2">
                    <li className="color-black">
                      <code className="bg-destructive/20 px-1 py-0.5 rounded text-xs">
                        NEXT_PUBLIC_SUPABASE_URL
                      </code>
                    </li>
                    <li>
                      <code className="bg-destructive/20 px-1 py-0.5 rounded text-xs">
                        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
                      </code>
                    </li>
                    <li>
                      <code className="bg-destructive/20 px-1 py-0.5 rounded text-xs">
                        SUPABASE_SERVICE_ROLE_KEY
                      </code>{" "}
                      (optional)
                    </li>
                  </ul>

                  <p className="text-sm text-destructive/90">
                    <em>
                      If you&apos;re still working through setup, feel free to
                      ignore this warning.
                    </em>
                  </p>
                </div>
                <button
                  onClick={() => setShowBanner(false)}
                  className="p-1 hover:bg-destructive/20 rounded transition-colors"
                  aria-label="Dismiss banner"
                >
                  <X className="w-4 h-4 text-destructive" />
                </button>
              </div>
            </div>
          )}

          <div className="border rounded-lg bg-card p-8 shadow-sm">
            {currentStep === "welcome" && (
              <WelcomeStep onNext={() => setCurrentStep("env_vars")} />
            )}
            {currentStep === "env_vars" && (
              <EnvVarsStep
                onNext={handleNext}
                isComplete={status?.envVarsSet || false}
              />
            )}
            {currentStep === "migrations" && (
              <MigrationsStep
                onNext={handleNext}
                isComplete={status?.migrationsRun || false}
              />
            )}
            {currentStep === "create_user" && (
              <FirstUserStep
                onNext={handleNext}
                isComplete={status?.userCreated || false}
              />
            )}
            {currentStep === "complete" && (
              <CompleteStep onComplete={handleComplete} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-full flex items-center justify-center bg-muted/30">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-purple/20 border-t-purple rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}
