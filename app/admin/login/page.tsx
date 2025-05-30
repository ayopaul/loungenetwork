//app/admin/login/page.tsx
"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    console.log("🔍 Form submitted, password:", );
    e.preventDefault();
    
    if (!password) {
      console.log("❌ No password entered");
      setError("Please enter a password");
      return;
    }
    
    try {
      console.log("🔍 Calling signIn...");
      const res = await signIn("credentials", {
        redirect: false,
        password,
      });
      
      console.log("🔍 SignIn response:", res);
      
      if (res?.error) {
        console.log("❌ Login error:", res.error);
        setError("Invalid password. Please try again.");
      } else if (res?.ok) {
        console.log("✅ Login successful");
        router.push("/admin");
      } else {
        console.log("⚠️ Unexpected response:", res);
        setError("Login failed. Please try again.");
      }
    } catch (error) {
      console.error("💥 Exception:", error);
      setError("An error occurred. Please try again.");
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
          className="w-full rounded-md bg-primary p-2 hover:bg-primary/90"
          onClick={() => console.log("🔍 Button clicked")} // Temporary debug
        >
          Sign In
        </button>
      </form>
    </div>
  );
}