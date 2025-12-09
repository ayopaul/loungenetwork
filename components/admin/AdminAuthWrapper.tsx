"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";

export function AdminAuthWrapper({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      // Use window.location for full page reload to ensure middleware runs
      window.location.href = "/admin/login";
    }
  }, [status]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return null; // Prevent rendering if not authenticated
  }

  return <>{children}</>;
}
