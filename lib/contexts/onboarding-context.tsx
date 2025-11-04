"use client";

import * as React from "react";

type OnboardingStatus = {
  complete: boolean;
  step: string;
  envVarsSet: boolean;
  migrationsRun: boolean;
  userCreated: boolean;
};

type OnboardingContextType = {
  status: OnboardingStatus | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
};

const OnboardingContext = React.createContext<OnboardingContextType | null>(
  null,
);

export function OnboardingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [status, setStatus] = React.useState<OnboardingStatus | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchStatus = React.useCallback(async () => {
    try {
      const response = await fetch("/api/onboarding/status");
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error("Failed to check onboarding status:", error);
      // Default to complete on error to avoid blocking the app
      setStatus({
        complete: true,
        step: "complete",
        envVarsSet: true,
        migrationsRun: true,
        userCreated: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const refetch = React.useCallback(async () => {
    setIsLoading(true);
    await fetchStatus();
  }, [fetchStatus]);

  return (
    <OnboardingContext.Provider value={{ status, isLoading, refetch }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = React.useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }
  return context;
}
