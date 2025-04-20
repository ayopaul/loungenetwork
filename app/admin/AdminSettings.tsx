"use client";

import { useState } from "react";
import SettingsShell from "@/components/admin/SettingsShell";
import ScheduleEditor from "@/components/admin/ScheduleEditor";
import BlogManager from "@/components/admin/BlogManager";



const StationManager = () => (
  <div className="bg-white rounded-lg shadow p-6 text-muted-foreground text-sm">
    Station manager coming soon...
  </div>
);

export default function AdminSettings() {
  const [section, setSection] = useState<"shows" | "blog" | "stations">("shows");

  return (
    <SettingsShell
      title="Settings"
      description="Manage your station settings and set show preferences."
      nav={[
        { label: "Shows", value: "shows" },
        { label: "Blog", value: "blog" },
        { label: "Stations", value: "stations" }
      ]}
      current={section}
      onSelect={(val) => setSection(val as "shows" | "blog" | "stations")}
    >
      {section === "shows" && <ScheduleEditor />}
      {section === "blog" && <BlogManager />}
      {section === "stations" && <StationManager />}
    </SettingsShell>
  );
}