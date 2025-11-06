"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LogoWithBadge } from "@/components/branding/logo-with-badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/contexts/auth-context";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [validationError, setValidationError] = React.useState<string | null>(
    null,
  );

  // Redirect if already logged in
  React.useEffect(() => {
    if (!authLoading && user) {
      router.push("/collections");
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationError(null);

    // Validate form
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      setValidationError(result.error.issues[0].message);
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: result.data.email,
        password: result.data.password,
      });

      if (signInError) {
        if (signInError.message.includes("Invalid login credentials")) {
          throw new Error("Invalid email or password");
        }
        throw signInError;
      }

      if (data.user) {
        // Redirect will happen via useEffect when auth state updates
        router.push("/collections");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to sign in. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-full flex items-center justify-center bg-muted/30">
        <div className="w-8 h-8 border-4 border-purple/20 border-t-purple rounded-full animate-spin" />
      </div>
    );
  }

  // Don't render form if already logged in
  if (user) {
    return null;
  }

  return (
    <div className="min-h-full flex items-center justify-center bg-muted/30 p-6">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and header */}
        <div className="text-center space-y-4">
          <LogoWithBadge size="md" className="justify-center mb-6" />
          <div className="space-y-2">
            <h1 className="text-3xl font-heading font-bold">Welcome back</h1>
            <p className="text-muted-foreground">
              Sign in to access your CMS
            </p>
          </div>
        </div>

        {/* Login form */}
        <div className="border rounded-lg bg-card p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
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
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              </div>
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

            <Button
              type="submit"
              disabled={isSubmitting || !email || !password}
              className="w-full bg-purple hover:bg-purple/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </div>

        {/* Footer info */}
        <div className="bg-muted/50 border border-border rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-purple/20 text-purple flex items-center justify-center flex-shrink-0 text-xs font-bold">
              ℹ
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">First time here?</p>
              <p className="text-sm text-muted-foreground">
                If you haven&apos;t set up your CMS yet, you&apos;ll need to
                complete the onboarding process first.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
