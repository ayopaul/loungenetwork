//components/admin/ScheduleEditor.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useShowStore, ScheduleSlot } from "@/stores/useShowStore";
import { slugify } from "@/lib/slugify";
import ShowDialog from "./ShowDialog";

const weekdays = [
  { label: "Sunday", value: "0" },
  { label: "Monday", value: "1" },
  { label: "Tuesday", value: "2" },
  { label: "Wednesday", value: "3" },
  { label: "Thursday", value: "4" },
  { label: "Friday", value: "5" },
  { label: "Saturday", value: "6" },
];

interface ScheduleEditorProps {
  station: { id: string; name: string };
}

export default function ScheduleEditor({ station }: ScheduleEditorProps) {
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState("0");
  const { openDialog, setActiveDay: setStoreActiveDay } = useShowStore();

  // Fetch schedule data when the station ID changes
  useEffect(() => {
    if (!station?.id) return;
    setLoading(true);
    fetch(`/api/schedule?stationId=${station.id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch schedule: ${res.statusText}`);
        }
        return res.json();
      })
      .then((data: ScheduleSlot[]) => {
        setSchedule(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Fetch schedule error:", err);
        toast.error("Could not load schedule. Please try again.");
        setSchedule([]);
      })
      .finally(() => setLoading(false));
  }, [station]);

  // Scroll active tab into view
  useEffect(() => {
    const activeTab = document.querySelector(`button[data-state="active"]`);
    if (activeTab) {
      activeTab.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [activeDay]);

  // Sync active day with store
  useEffect(() => {
    setStoreActiveDay(Number(activeDay));
  }, [activeDay, setStoreActiveDay]);

  // Handle adding a new show - opens dialog
  const handleAddShow = () => {
    openDialog(undefined, Number(activeDay));
  };

  // Handle editing an existing show - opens dialog
  const handleEditShow = (show: ScheduleSlot) => {
    openDialog(show);
  };

  // Save handler called from ShowForm via ShowDialog
  const handleSaveShow = useCallback(async (slot: ScheduleSlot, isNew: boolean) => {
    const safeTitle = slot.showTitle?.trim() || "Untitled Show";
    const safeStartTime = slot.startTime?.trim() || "00:00";
    const safeSlug = `${slugify(safeTitle)}-${safeStartTime.replace(":", "")}`;

    const safeSlot = {
      ...slot,
      showTitle: safeTitle,
      startTime: safeStartTime,
      endTime: slot.endTime?.trim() || "00:30",
      thumbnailUrl: slot.thumbnailUrl?.trim() || "/placeholder-image.svg",
      description: slot.description?.trim() || "No description available.",
      slug: safeSlug,
      stationId: station?.id,
    };

    try {
      const res = await fetch("/api/schedule/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stationId: station?.id, schedule: [safeSlot] }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Save failed" }));
        throw new Error(errorData.message || "Save failed");
      }

      const savedData = await res.json();
      toast.success("Show saved successfully.");

      // Update schedule state
      setSchedule((prev) => {
        if (isNew) {
          // Add new show
          const serverSlot = savedData.schedule?.[0] || safeSlot;
          return [...prev, serverSlot];
        } else {
          // Update existing show
          return prev.map((s) => {
            if (s.id === slot.id) {
              return savedData.schedule?.[0] || safeSlot;
            }
            return s;
          });
        }
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Something went wrong while saving.";
      console.error("Save error:", err);
      toast.error(errorMessage);
      throw err; // Re-throw so the form knows it failed
    }
  }, [station?.id]);

  // Delete handler called from ShowForm via ShowDialog
  const handleDeleteShow = useCallback(async (id: string) => {
    // For new unsaved shows, just remove from state
    if (id.startsWith("new-")) {
      setSchedule((prev) => prev.filter((slot) => slot.id !== id));
      toast.info("Show removed.");
      return;
    }

    try {
      const res = await fetch(`/api/schedule/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stationId: station?.id, scheduleSlotId: id }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Delete failed" }));
        throw new Error(errorData.message || "Delete failed on server.");
      }

      setSchedule((prev) => prev.filter((slot) => slot.id !== id));
      toast.success("Show deleted successfully.");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Something went wrong while deleting.";
      console.error("Delete error:", err);
      toast.error(errorMessage);
      throw err;
    }
  }, [station?.id]);

  // Format time for display
  const formatTime = (time: string) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (!station?.id) {
    return <p className="text-center text-muted-foreground py-10">Select a station to begin editing its schedule.</p>;
  }

  if (loading) {
    return <p className="text-center text-muted-foreground py-10">Loading schedule...</p>;
  }

  return (
    <main className="p-4 md:p-6 max-w-7xl mx-auto bg-background text-foreground rounded-lg shadow-md">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-primary">Schedule Editor</h1>
        <p className="text-muted-foreground">
          Currently editing: <span className="font-semibold">{station.name}</span>
        </p>
      </header>

      <Tabs value={activeDay} onValueChange={setActiveDay} className="w-full">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-4 md:grid-cols-7 mb-4">
          {weekdays.map((day) => (
            <TabsTrigger key={day.value} value={day.value} className="text-xs sm:text-sm">
              {day.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {weekdays.map((day) => (
          <TabsContent key={day.value} value={day.value}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Shows for {day.label}</h2>
              <Button onClick={handleAddShow} variant="outline">
                + Add New Show
              </Button>
            </div>

            <div className="space-y-4">
              {schedule
                .filter((slot) => slot.weekday === Number(day.value))
                .sort((a, b) => (a.startTime || "00:00").localeCompare(b.startTime || "00:00"))
                .map((slot) => (
                  <div
                    key={slot.id}
                    onClick={() => handleEditShow(slot)}
                    className="border p-4 rounded-lg shadow bg-card cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      {/* Thumbnail */}
                      <div className="relative w-20 h-20 rounded border bg-muted flex-shrink-0 overflow-hidden">
                        <Image
                          src={slot.thumbnailUrl || "/placeholder-image.svg"}
                          alt={slot.showTitle}
                          fill
                          sizes="80px"
                          className="object-cover"
                          unoptimized
                        />
                      </div>

                      {/* Show Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">{slot.showTitle || "Untitled Show"}</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                        </p>
                        {slot.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {slot.description}
                          </p>
                        )}
                      </div>

                      {/* Edit indicator */}
                      <div className="text-muted-foreground">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}

              {schedule.filter((slot) => slot.weekday === Number(day.value)).length === 0 && (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <p className="text-muted-foreground mb-4">No shows scheduled for {day.label}.</p>
                  <Button onClick={handleAddShow} variant="outline">
                    + Add First Show
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Show Dialog */}
      <ShowDialog station={station} onSave={handleSaveShow} onDelete={handleDeleteShow} />
    </main>
  );
}
