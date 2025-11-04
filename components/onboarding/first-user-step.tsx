"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { z } from "zod";

type FirstUserStepProps = {
  onNext: () => void;
  isComplete: boolean;
};

const userSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be less than 72 characters"),
});

export function FirstUserStep({ onNext, isComplete }: FirstUserStepProps) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [validationError, setValidationError] = React.useState<string | null>(
    null,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationError(null);

    // Validate form
    const result = userSchema.safeParse({ email, password });
    if (!result.success) {
      setValidationError(result.error.issues[0].message);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/create-first-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create user");
      }

      // Success! Move to next step
      onNext();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create admin user",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isComplete) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple/10 mb-2">
            <CheckCircle2 className="w-6 h-6 text-purple" />
          </div>
          <h2 className="text-2xl font-heading font-bold">
            Admin User Created
          </h2>
          <p className="text-muted-foreground">
            Your admin account is ready to use
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
          Create Your Admin Account
        </h2>
        <p className="text-muted-foreground">
          Set up your admin user to start managing content
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com"
            className="w-full px-3 py-2 text-sm border rounded-md outline-none focus:ring-2 focus:ring-purple bg-background"
            autoFocus
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 text-sm border rounded-md outline-none focus:ring-2 focus:ring-purple bg-background pr-10"
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-muted transition-colors"
              disabled={isSubmitting}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Eye className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Must be at least 8 characters
          </p>
        </div>

        {validationError && (
          <div className="flex items-start gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{validationError}</p>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="bg-purple/10 border border-purple/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-purple/20 text-purple flex items-center justify-center flex-shrink-0 text-xs font-bold">
              ℹ
            </div>
            <div className="space-y-1">
              <p className="font-medium text-sm">About your admin account</p>
              <p className="text-sm text-muted-foreground">
                This user will have full access to manage content, collections,
                and settings in your CMS.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="submit"
            disabled={isSubmitting || !email || !password}
            className="bg-purple hover:bg-purple/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Admin User"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
