'use client';

import { useEffect, useState } from "react";
import { SettingsShell } from "@/components/admin/SettingsShell";
import ScheduleEditor from "@/components/admin/ScheduleEditor";
import StationManager from "@/components/admin/StationManager";
import BlogManager from "@/components/admin/BlogManager";
import { AdminAuthWrapper } from "@/components/admin/AdminAuthWrapper";
import type { Station } from "@/types/types"; // ✅ import type
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";



export default function AdminSettingsPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null); // ✅ Strict typing
  const [section, setSection] = useState<'shows' | 'blog' | 'stations'>('shows');

  useEffect(() => {
    async function fetchStations() {
      const res = await fetch("/api/stations");
      const data: Station[] = await res.json(); // ✅ Cast it
      setStations(data);
      setSelectedStation(data[0]);
    }
    fetchStations();
  }, []);

  if (!selectedStation) {
    return <p className="text-muted-foreground p-6">Loading stations...</p>;
  }

  return (
    <AdminAuthWrapper>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
  
        {/* Station Selector */}
        <div className="sticky top-0 z-50 bg-background border-b p-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
  
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="capitalize">
                <p className="text-muted-foreground p-6"> Select station</p>{selectedStation.name}
              </Button>
            </DropdownMenuTrigger>
  
            <DropdownMenuContent align="end">
              {stations.map((station) => (
                <DropdownMenuItem
                  key={station.id}
                  onClick={() => setSelectedStation(station)}
                  className="cursor-pointer capitalize"
                >
                  {station.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
  
        {/* Settings */}
        <SettingsShell
          title="Settings"
          description="Manage your station settings and set show preferences."
          nav={[
            { label: "Stations", value: "stations" },
            { label: "Shows", value: "shows" },
            { label: "Blog", value: "blog" },
          ]}
          current={section}
          onSelect={(val: string) => setSection(val as 'shows' | 'blog' | 'stations')}
        >
          <div className="min-h-[500px] p-4 bg-background text-foreground rounded-md">
            {section === "shows" && (
              <ScheduleEditor station={selectedStation} />
            )}
            {section === "blog" && (
              <BlogManager station={selectedStation} />
            )}
            {section === "stations" && (
              <StationManager />
            )}
          </div>
        </SettingsShell>
  
      </div> {/* ✅ Correct closing */}
    </AdminAuthWrapper>
  );
  
}
