//app/admin/login/page.tsx
"use client";

import { useState, useCallback } from "react";
import { signIn } from "next-auth/react";
import Turnstile from "@/components/auth/Turnstile";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileError, setTurnstileError] = useState(false);

  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token);
    setTurnstileError(false);
  }, []);

  const handleTurnstileError = useCallback(() => {
    setTurnstileToken(null);
    setTurnstileError(true);
    setError("Security verification failed. Please refresh and try again.");
  }, []);

  const handleTurnstileExpire = useCallback(() => {
    setTurnstileToken(null);
    setError("Security verification expired. Please complete it again.");
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      setError("Please enter your username");
      return;
    }

    if (!password) {
      setError("Please enter your password");
      return;
    }

    if (!turnstileToken) {
      setError("Please complete the security verification");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        username: username.trim().toLowerCase(),
        password,
        turnstileToken,
        callbackUrl: "/admin",
      });

      if (res?.error) {
        // Parse specific error messages
        if (res.error.includes("locked")) {
          setError("Account temporarily locked. Please try again in 15 minutes.");
        } else if (res.error.includes("verification")) {
          setError("Security verification failed. Please refresh and try again.");
        } else {
          setError("Invalid username or password.");
        }
        setIsLoading(false);
        // Reset turnstile on error
        setTurnstileToken(null);
      } else if (res?.ok) {
        await new Promise(resolve => setTimeout(resolve, 100));
        window.location.href = "/admin";
      } else {
        setError("Login failed. Please try again.");
        setIsLoading(false);
      }
    } catch {
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <form
        onSubmit={handleLogin}
        className="space-y-6 rounded-lg bg-card p-8 shadow-md w-full max-w-sm border border-border"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold">Admin Portal</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Authorized personnel only
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3">
            <p className="text-red-500 text-sm text-center">{error}</p>
          </div>
        )}

        <div>
          <label htmlFor="username" className="block text-sm font-medium mb-1">
            Username
          </label>
          <input
            id="username"
            type="text"
            autoComplete="username"
            className="block w-full rounded-md border border-border bg-background p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
            placeholder="Enter username"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className="block w-full rounded-md border border-border bg-background p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            placeholder="Enter password"
          />
        </div>

        {/* Turnstile Widget */}
        <div className="py-2">
          {turnstileError ? (
            <div className="text-center text-sm text-muted-foreground">
              <p>Security check failed.</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="text-primary hover:underline mt-1"
              >
                Refresh page to try again
              </button>
            </div>
          ) : (
            <Turnstile
              onVerify={handleTurnstileVerify}
              onError={handleTurnstileError}
              onExpire={handleTurnstileExpire}
              theme="auto"
            />
          )}
          {turnstileToken && !turnstileError && (
            <p className="text-xs text-green-600 dark:text-green-400 text-center mt-2">
              Verified
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-primary text-primary-foreground p-2.5 font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          disabled={isLoading || !turnstileToken}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Signing in...
            </span>
          ) : (
            "Sign In"
          )}
        </button>

        <p className="text-xs text-center text-muted-foreground">
          Protected by Cloudflare Turnstile
        </p>
      </form>
    </div>
  );
}
