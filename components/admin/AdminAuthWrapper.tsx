'use client';

import { useEffect, useState } from 'react';

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'password123'; // fallback if env is not loaded

export function AdminAuthWrapper({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPassword = window.sessionStorage.getItem('admin_password');
      if (savedPassword && savedPassword === ADMIN_PASSWORD) {
        setAuthenticated(true);
      }
      setLoading(false);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = (e.target as HTMLFormElement).elements.namedItem('password') as HTMLInputElement;
    const enteredPassword = input.value;

    if (enteredPassword === ADMIN_PASSWORD) {
      sessionStorage.setItem('admin_password', enteredPassword);
      setAuthenticated(true);
    } else {
      alert('Incorrect password.');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!authenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <form
          onSubmit={handleSubmit}
          className="space-y-4 bg-background text-foreground border p-6 rounded-lg shadow w-full max-w-sm"
        >
          <h2 className="text-lg font-semibold">Admin Access</h2>
          <input
            type="password"
            name="password"
            placeholder="Enter admin password"
            className="w-full p-2 rounded border"
          />
          <button
            type="submit"
            className="w-full p-2 bg-primary text-white rounded hover:bg-primary/80 transition"
          >
            Enter
          </button>
        </form>
      </div>
    );
  }

  return <>{children}</>;
}
