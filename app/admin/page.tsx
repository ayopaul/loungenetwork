// app/admin/page.tsx
'use client';

import { useEffect, useState } from "react";
import { SettingsShell } from "@/components/admin/SettingsShell";
import ScheduleEditor from "@/components/admin/ScheduleEditor";
import StationManager from "@/components/admin/StationManager";
import BlogManager from "@/components/admin/BlogManager";
import OAPManager from "@/components/admin/OAPManager";
import { AdminAuthWrapper } from "@/components/admin/AdminAuthWrapper";
import type { Station } from "@/types/types"; //  import type
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";



export default function AdminSettingsPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null); // Strict typing
  const [section, setSection] = useState<"stations" | "shows" | "blog" | "team">("stations");

  useEffect(() => {
    const saved = localStorage.getItem("selected-station");
    let parsed: Station | null = null;

    if (saved) {
      try {
        parsed = JSON.parse(saved);
      } catch {}
    }

    async function fetchStations() {
      const res = await fetch("/api/stations");
      const data: Station[] = await res.json();
      setStations(data);

      if (parsed && data.some(s => s.id === parsed.id)) {
        setSelectedStation(parsed);
      } else {
        setSelectedStation(data[0]);
        localStorage.setItem("selected-station", JSON.stringify(data[0]));
      }
    }

    fetchStations();
  }, []);

  useEffect(() => {
    function handleBlogRefresh() {
      setSection("blog");
      window.location.reload();
    }

    window.addEventListener("refresh-blog-tab", handleBlogRefresh);
    return () => window.removeEventListener("refresh-blog-tab", handleBlogRefresh);
  }, []);

  if (!selectedStation) {
    return <p className="text-muted-foreground p-6">Loading stations...</p>;
  }

  return (
    <AdminAuthWrapper>
      <div className="max-w-7xl mx-auto">
        {/* Sticky Header */}
          <div className="sticky top-0 z-50 bg-background border-b px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-start justify-between gap-4">
              {/* Left: Title (60%) */}
              <div className="w-full sm:w-3/5">
                <h1 className="text-2xl font-bold">Admin Panel</h1>
              </div>

              {/* Right: Station Selector (40%) */}
              <div className="w-full sm:w-2/5">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                  <Button
                      variant="outline"
                      className="w-full text-left text-sm p-6 flex flex-col items-start gap-0.5 whitespace-normal break-words leading-tight"
                    >
                      <span className="text-muted-foreground text-xs">Station:</span>
                      <span className="font-medium capitalize break-words ">
                        {selectedStation.name}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">
                    {stations.map((station) => (
                      <DropdownMenuItem
                        key={station.id}
                        onClick={() => {
                          setSelectedStation(station);
                          localStorage.setItem("selected-station", JSON.stringify(station));
                        }}
                        className="cursor-pointer capitalize"
                      >
                        {station.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

  
        {/* Main Content */}
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <SettingsShell
            title="Settings"
            description="Manage your station settings and set show preferences."
            nav={[
              { label: "Stations", value: "stations" },
              { label: "Shows", value: "shows" },
              { label: "Blog", value: "blog" },
              { label: "Team", value: "team" },
            ]}
            current={section}
            onSelect={(val: string) => setSection(val as 'shows' | 'blog' | 'stations')}
          >
            <div className="min-h-[500px] p-4 bg-background text-foreground rounded-md">
              {section === "shows" && <ScheduleEditor station={selectedStation} />}
              {section === "blog" && <BlogManager station={selectedStation} />}
              {section === "stations" && <StationManager />}
              {section === "team" && <OAPManager station={selectedStation} />}
            </div>
          </SettingsShell>
        </div>
      </div>
    </AdminAuthWrapper>
  );
  
  
}
