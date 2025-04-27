"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await signIn("credentials", {
      redirect: false,
      password, // pass password field
    });

    if (res?.error) {
      setError("Invalid password. Please try again.");
    } else {
      router.push("/admin"); // Redirect to admin dashboard
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
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-primary p-2 text-white hover:bg-primary/90"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}
