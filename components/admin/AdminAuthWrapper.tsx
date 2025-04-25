"use client";

import { useState, useEffect } from "react";

export function AdminAuthWrapper({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <p className="text-sm text-muted-foreground">Loading Admin Panel...</p>
      </div>
    );
  }

  return <>{children}</>;
}
