"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function AdminAuthWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("admin-auth");
    if (!isAuthenticated) {
      router.replace("/admin/login"); // or wherever your auth form is
    }
  }, []);

  return <>{children}</>;
}