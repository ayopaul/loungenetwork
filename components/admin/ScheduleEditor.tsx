"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type ScheduleSlot = {
  id: string;
  showTitle: string;
  startTime: string;
  endTime: string;
  description: string;
  thumbnailUrl: string;
  weekday: number;
};

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

  // Helper function to clear error styles
  const clearErrorStyles = (el: HTMLElement) => {
    el.classList.remove("border-red-500", "ring-2", "ring-red-400");
  };

  useEffect(() => {
    if (!station?.id) return;
    setLoading(true);
    fetch(`/api/schedule?stationId=${station.id}`)
      .then((res) => res.json())
      .then((data: ScheduleSlot[]) => setSchedule(data))
      .finally(() => setLoading(false));
  }, [station]);

  useEffect(() => {
    const activeTab = document.querySelector(`[data-state="active"]`);
    if (activeTab) {
      activeTab.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [activeDay]);

  const updateSlot = (id: string, field: keyof ScheduleSlot, value: string) => {
    setSchedule((prev) =>
      prev.map((slot) =>
        slot.id === id ? { ...slot, [field]: value } : slot
      )
    );
  };

  const handleAddSlot = () => {
    const newSlot: ScheduleSlot = {
      id: `new-${Date.now()}`,
      showTitle: "",
      startTime: "",
      endTime: "",
      description: "",
      thumbnailUrl: "",
      weekday: Number(activeDay),
    };
    setSchedule((prev) => [...prev, newSlot]);
  };

  const handleSave = async () => {
    function slugify(text: string): string {
      return text
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9\-]/g, "")
        .replace(/\-+/g, "-");
    }

    // Helper to generate unique slug
    const generateSlug = (title: string, startTime: string): string => {
      const baseSlug = slugify(title);
      const timeSlug = startTime.replace(":", "");
      return `${baseSlug}-${timeSlug}`;
    };

    let hasInvalid = false;
    let firstInvalidId: string | null = null;

    // Define the type for valid field names
    type ValidFieldName = 'showTitle' | 'startTime' | 'endTime' | 'thumbnailUrl';

    const validatedSchedule = schedule.map((slot) => {
      const errors: ValidFieldName[] = [];

      const showTitle = slot.showTitle?.trim();
      const startTime = slot.startTime?.trim();
      const endTime = slot.endTime?.trim();
      const thumbnailUrl = slot.thumbnailUrl?.trim();
      const description = slot.description?.trim();

      if (!showTitle) errors.push("showTitle");
      if (!startTime) errors.push("startTime");
      if (!endTime) errors.push("endTime");
      if (!thumbnailUrl) errors.push("thumbnailUrl");

      if (errors.length > 0) {
        hasInvalid = true;
        const elIds: Record<ValidFieldName, string> = {
          showTitle: `title-${slot.id}`,
          startTime: `start-${slot.id}`,
          endTime: `end-${slot.id}`,
          thumbnailUrl: `thumb-${slot.id}`,
        };
        errors.forEach((field) => {
          const el = document.getElementById(elIds[field]);
          if (el) {
            el.classList.add("border-red-500", "ring-2", "ring-red-400");
            if (!firstInvalidId) firstInvalidId = elIds[field];
          }
        });
      }

      const safeTitle = showTitle || "Untitled Show";
      const safeStartTime = startTime || "00:00";
      const safeSlug = generateSlug(safeTitle, safeStartTime);

      return {
        ...slot,
        showTitle: safeTitle,
        slug: safeSlug,
        startTime: safeStartTime,
        endTime: endTime || "00:30",
        thumbnailUrl: thumbnailUrl || "/placeholder.jpg",
        description: description || "No description available.",
        weekday: slot.weekday,
        stationId: station?.id,
      };
    });

    if (hasInvalid) {
      if (firstInvalidId) {
        const el = document.getElementById(firstInvalidId);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    
      toast.error("Please fill in all required fields before saving.", {
        duration: 4000,
      });
      return;
    }
    
    try {
      const res = await fetch("/api/schedule/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stationId: station?.id,
          schedule: validatedSchedule,
        }),
      });
    
      if (!res.ok) throw new Error("Failed to save schedule");
    
      toast.success("Schedule saved successfully.");
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Something went wrong while saving.");
    }
  };

  const generateTimeOptions = () => {
    const options: string[] = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) {
        const hour = h.toString().padStart(2, "0");
        const minute = m.toString().padStart(2, "0");
        options.push(`${hour}:${minute}`);
      }
    }
    return options;
  };

  if (!station) return <p className="text-sm text-muted-foreground">Select a station to begin editing.</p>;
  if (loading) return <p className="text-sm text-muted-foreground">Loading schedule...</p>;

  return (
    <main className="p-6 max-w-6xl mx-auto bg-background text-foreground rounded-lg">
      <h2 className="text-lg font-semibold mb-4">Editing: {station.name}</h2>

      <Tabs defaultValue="0" className="w-full" onValueChange={setActiveDay}>
        <div className="overflow-x-auto whitespace-nowrap mb-4 -mx-4 px-4 no-scrollbar">
          <TabsList className="mb-4 overflow-x-auto whitespace-nowrap no-scrollbar">
            {weekdays.map(day => (
              <TabsTrigger key={day.value} value={day.value}>
                {day.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {weekdays.map(day => {
          const daySlots = schedule.filter(slot => String(slot.weekday) === day.value);

          return (
            <TabsContent key={day.value} value={day.value}>
              <div className="space-y-6">
                {daySlots.map(slot => (
                  <div key={slot.id} className="border border-border bg-muted/50 backdrop-blur rounded-lg p-6 space-y-4 shadow-sm transition hover:bg-muted/70">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`title-${slot.id}`}>Show Title</Label>
                        <Input
                          id={`title-${slot.id}`}
                          value={slot.showTitle}
                          onChange={(e) => {
                            updateSlot(slot.id, "showTitle", e.target.value);
                            clearErrorStyles(e.target);
                          }}
                        />
                        {!slot.showTitle && (
                          <p className="text-sm text-red-500">Show title is required</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`thumb-${slot.id}`}>Thumbnail</Label>
                        <input
                          type="file"
                          accept="image/*"
                          id={`thumb-${slot.id}`}
                          className="block w-full text-sm text-muted-foreground file:border file:rounded file:px-4 file:py-2 file:bg-muted/40 file:hover:bg-muted/60"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            const formData = new FormData();
                            formData.append("file", file);

                            try {
                              const res = await fetch("/api/upload", {
                                method: "POST",
                                body: formData,
                              });

                              const data = await res.json();
                              if (!res.ok) throw new Error(data.message || "Upload failed");

                              updateSlot(slot.id, "thumbnailUrl", data.url);
                              clearErrorStyles(e.target);
                            } catch (err) {
                              toast.error("Could not upload thumbnail.");
                            }
                          }}
                        />
                        {!slot.thumbnailUrl && (
                          <p className="text-sm text-red-500">Thumbnail is required</p>
                        )}
                        {slot.thumbnailUrl && (
                          <img
                            src={slot.thumbnailUrl}
                            alt="Thumbnail preview"
                            className="h-20 mt-2 rounded object-cover border"
                          />
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`start-${slot.id}`}>Start Time</Label>
                          <select
                            id={`start-${slot.id}`}
                            value={slot.startTime}
                            onChange={(e) => {
                              updateSlot(slot.id, "startTime", e.target.value);
                              clearErrorStyles(e.target);
                            }}
                            className="w-full border rounded px-3 py-2 bg-background text-foreground"
                          >
                            {generateTimeOptions().map(time => (
                              <option key={time} value={time}>{time}</option>
                            ))}
                          </select>
                          {!slot.startTime && (
                            <p className="text-sm text-red-500">Start time is required</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`end-${slot.id}`}>End Time</Label>
                          <select
                            id={`end-${slot.id}`}
                            value={slot.endTime}
                            onChange={(e) => {
                              updateSlot(slot.id, "endTime", e.target.value);
                              clearErrorStyles(e.target);
                            }}
                            className="w-full border rounded px-3 py-2 bg-background text-foreground"
                          >
                            {generateTimeOptions().map(time => (
                              <option key={time} value={time}>{time}</option>
                            ))}
                          </select>
                          {!slot.endTime && (
                            <p className="text-sm text-red-500">End time is required</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`desc-${slot.id}`}>Description</Label>
                      <Textarea
                        id={`desc-${slot.id}`}
                        value={slot.description}
                        onChange={(e) => updateSlot(slot.id, "description", e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <Button onClick={handleAddSlot} variant="outline" className="mt-6">+ Add New Show</Button>
            </TabsContent>
          );
        })}
      </Tabs>

      <Button onClick={handleSave} className="mt-6">Save Changes</Button>
    </main>
  );
}