'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ScheduleEditor from "@/components/admin/ScheduleEditor";
import BlogManager from "@/components/admin/BlogManager";
import StationManager from "@/components/admin/StationManager";

const STATIONS = [
  { id: "lounge-877fm", name: "Lounge 87.7 FM" },
  { id: "lounge-global", name: "Lounge Global" },
];

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("stations");
  const [selectedStation, setSelectedStation] = useState<{ id: string; name: string }>(STATIONS[0]); // default selected station object

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <div className="flex-1 p-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Settings</h2>
            <p className="text-muted-foreground">Manage your station settings and set show preferences.</p>
          </div>

          {/* Station Selector */}
          <div>
            <label htmlFor="station" className="block text-sm font-medium text-foreground mb-1">Select Station:</label>
            <select
              id="station"
              value={selectedStation.id}
              onChange={(e) => {
                const stationId = e.target.value;
                const station = STATIONS.find((s) => s.id === stationId);
                if (station) {
                  setSelectedStation(station);
                }
              }}
              className="border p-2 rounded-md bg-background text-foreground"
            >
              {STATIONS.map((station) => (
                <option key={station.id} value={station.id}>
                  {station.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-6">
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
  );
}
