"use client";

import { useHydrateStation } from "@/app/stores/useStationAdminStore";
import { toast } from "@/hooks/use-toast";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
