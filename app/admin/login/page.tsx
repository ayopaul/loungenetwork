//app/admin/login/page.tsx
"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password) {
      setError("Please enter a password");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        password,
        callbackUrl: "/admin",
      });

      if (res?.error) {
        setError("Invalid password. Please try again.");
        setIsLoading(false);
      } else if (res?.ok) {
        // Small delay to ensure session cookie is set before redirect
        await new Promise(resolve => setTimeout(resolve, 100));
        // Use window.location for full page reload to pick up new session
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
        className="space-y-6 rounded-lg bg-card p-8 shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold text-center">Admin Login</h2>
        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}
        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="mt-1 block w-full rounded-md border border-border bg-background p-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-md bg-primary p-2 hover:bg-primary/90 disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}