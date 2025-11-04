"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CheckCircle2, Circle } from "lucide-react";
import { EnvVarsStep } from "@/components/onboarding/env-vars-step";
import { MigrationsStep } from "@/components/onboarding/migrations-step";
import { FirstUserStep } from "@/components/onboarding/first-user-step";
import { WelcomeStep } from "@/components/onboarding/welcome-step";
import { CompleteStep } from "@/components/onboarding/complete-step";

type OnboardingStatus = {
  complete: boolean;
  step: string;
  envVarsSet: boolean;
  migrationsRun: boolean;
  userCreated: boolean;
};

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
    title: "Database Setup",
    description: "Run database migrations",
  },
  {
    id: "create_user",
    title: "Create Admin User",
    description: "Set up your admin account",
  },
  {
    id: "complete",
    title: "Complete",
    description: "You're all set!",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = React.useState<string>("welcome");
  const [status, setStatus] = React.useState<OnboardingStatus | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const checkStatus = React.useCallback(async () => {
    try {
      const response = await fetch("/api/onboarding/status");
      const data = await response.json();
      setStatus(data);

      if (data.complete) {
        setCurrentStep("complete");
      } else if (data.step) {
        setCurrentStep(data.step);
      }
    } catch (error) {
      console.error("Failed to check onboarding status:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const handleNext = () => {
    checkStatus();
  };

  const handleComplete = () => {
    router.push("/collections");
  };

  const getStepStatus = (stepId: string) => {
    if (!status) return "pending";

    const stepOrder = ["welcome", "env_vars", "migrations", "create_user", "complete"];
    const currentIndex = stepOrder.indexOf(currentStep);
    const stepIndex = stepOrder.indexOf(stepId);

    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "current";
    return "pending";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] dark:bg-[#0a0a0a]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple/20 border-t-purple rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5] dark:bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container max-w-5xl mx-auto px-6 py-3">
          <div className="flex items-center gap-2">
            <Image
              src="/brand/paperclip_logo.svg"
              alt="Paperclip CMS"
              width={120}
              height={24}
              className="h-6 w-auto dark:hidden"
            />
            <Image
              src="/brand/paperclip_logo_white.svg"
              alt="Paperclip CMS"
              width={120}
              height={24}
              className="h-6 w-auto hidden dark:block"
            />
            <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 bg-accent/80 dark:bg-accent/40 text-foreground border border-border tracking-wider">
              OSS
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container max-w-5xl mx-auto px-6 py-8">
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
          <div className="border rounded-lg bg-background p-8 shadow-sm">
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
