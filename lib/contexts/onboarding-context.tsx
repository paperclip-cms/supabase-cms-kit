"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

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
  telemetryEnabled: boolean;
  setTelemetryEnabled: (enabled: boolean) => void;
};

const OnboardingContext = createContext<OnboardingContextType | null>(null);

const TELEMETRY_STORAGE_KEY = "paperclip_oss_telemetry_preference";

export function OnboardingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [telemetryEnabled, setTelemetryEnabledState] = useState<boolean>(false);

  useEffect(() => {
    const stored = localStorage.getItem(TELEMETRY_STORAGE_KEY);
    if (stored !== null) {
      setTelemetryEnabledState(stored === "true");
    }
  }, []);

  const setTelemetryEnabled = useCallback((enabled: boolean) => {
    setTelemetryEnabledState(enabled);
    localStorage.setItem(TELEMETRY_STORAGE_KEY, enabled.toString());
  }, []);

  const fetchStatus = useCallback(async () => {
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

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    await fetchStatus();
  }, [fetchStatus]);

  return (
    <OnboardingContext.Provider
      value={{
        status,
        isLoading,
        refetch,
        telemetryEnabled,
        setTelemetryEnabled,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }
  return context;
}
