"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ScheduleEditor from "@/components/admin/ScheduleEditor";
import BlogManager from "@/components/admin/BlogManager";
import StationManager from "@/components/admin/StationManager"; // ✅ Correct import

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("stations");

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <div className="flex-1 p-6 space-y-6 max-w-7xl mx-auto">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Settings</h2>
          <p className="text-muted-foreground">
            Manage your station settings and set show preferences.
          </p>
        </div>

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
                <ScheduleEditor />
              </TabsContent>
              <TabsContent value="blog">
                <BlogManager />
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
