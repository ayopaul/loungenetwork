'use client';

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ScheduleEditor from "@/components/admin/ScheduleEditor";
import BlogManager from "@/components/admin/BlogManager";
import StationManager from "@/components/admin/StationManager";
import { AdminAuthWrapper } from "@/components/admin/AdminAuthWrapper";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

type Station = {
  id: string;
  name: string;
};

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("stations");
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);

  useEffect(() => {
    async function fetchStations() {
      const res = await fetch("/api/stations");
      const data: Station[] = await res.json();
      setStations(data);
      setSelectedStation(data[0]);
    }
    fetchStations();
  }, []);

  if (!selectedStation) return <div>Loading stations...</div>;

  return (
    <ProtectedRoute>
      <AdminAuthWrapper>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <div className="flex-1 p-6 space-y-6 max-w-7xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between sticky top-0 z-50 bg-background border-b p-4">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Settings</h2>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="capitalize">
                <p className="text-xl text-muted-foreground">selected station:</p> {selectedStation.name}
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

          <p className="text-muted-foreground">
            Manage your station settings and set show preferences.
          </p>

          {/* Tabs */}
          <Tabs defaultValue={activeTab} className="space-y-6" onValueChange={setActiveTab}>
            <div className="flex flex-col md:flex-row gap-6">
              <TabsList className="md:flex md:flex-col w-full md:w-1/4">
                <TabsTrigger value="stations">Stations</TabsTrigger>
                <TabsTrigger value="shows">Shows</TabsTrigger>
                <TabsTrigger value="blog">Blog</TabsTrigger>
              </TabsList>

              <div className="flex-1">
                <TabsContent value="stations">
                  <StationManager />
                </TabsContent>
                <TabsContent value="shows">
                  <ScheduleEditor station={selectedStation} />
                </TabsContent>
                <TabsContent value="blog">
                  <BlogManager station={selectedStation} />
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </div>
      </div>
    </AdminAuthWrapper>
    </ProtectedRoute>
  );
}
