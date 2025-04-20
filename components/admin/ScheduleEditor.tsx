"use client";

import { useEffect, useState } from "react";
import { useStationStore } from "@/stores/useStationStore";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

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

export default function ScheduleEditor() {
  const { selected } = useStationStore();
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState("0");

  useEffect(() => {
    if (!selected?.id) return;

    setLoading(true);
    fetch(`/api/schedule?stationId=${selected.id}`)
      .then(res => res.json())
      .then((data: ScheduleSlot[]) => setSchedule(data))
      .finally(() => setLoading(false));
  }, [selected]);

  const updateSlot = (id: string, field: keyof ScheduleSlot, value: string) => {
    setSchedule(prev =>
      prev.map(slot =>
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
    setSchedule(prev => [...prev, newSlot]);
  };

  const handleSave = async () => {
    try {
      const res = await fetch("/api/schedule/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stationId: selected?.id,
          schedule,
        }),
      });

      if (!res.ok) throw new Error("Failed to save schedule");
      alert("Schedule saved successfully! ✅");
    } catch (err) {
      console.error("Save error:", err);
      alert("There was a problem saving. ❌");
    }
  };

  if (!selected) return <p className="text-sm text-muted-foreground">Select a station to begin editing.</p>;
  if (loading) return <p className="text-sm">Loading schedule...</p>;

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <h2 className="text-lg font-semibold text-foreground">Editing: {selected.name}</h2>

      <Tabs defaultValue="0" className="w-full" onValueChange={setActiveDay}>
        <TabsList className="mb-4 overflow-x-auto">
          {weekdays.map(day => (
            <TabsTrigger key={day.value} value={day.value}>
              {day.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {weekdays.map(day => {
          const daySlots = schedule.filter(slot => String(slot.weekday) === day.value);

          return (
            <TabsContent key={day.value} value={day.value}>
              <div className="space-y-6">
                {daySlots.map(slot => (
                  <div key={slot.id} className="border p-6 rounded-lg bg-white text-black space-y-4 shadow-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`title-${slot.id}`}>Show Title</Label>
                        <Input
                          id={`title-${slot.id}`}
                          value={slot.showTitle}
                          onChange={(e) => updateSlot(slot.id, "showTitle", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`thumb-${slot.id}`}>Thumbnail URL</Label>
                        <Input
                          id={`thumb-${slot.id}`}
                          value={slot.thumbnailUrl}
                          onChange={(e) => updateSlot(slot.id, "thumbnailUrl", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`start-${slot.id}`}>Start Time</Label>
                        <Input
                          id={`start-${slot.id}`}
                          value={slot.startTime}
                          onChange={(e) => updateSlot(slot.id, "startTime", e.target.value)}
                          placeholder="e.g. 06:00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`end-${slot.id}`}>End Time</Label>
                        <Input
                          id={`end-${slot.id}`}
                          value={slot.endTime}
                          onChange={(e) => updateSlot(slot.id, "endTime", e.target.value)}
                          placeholder="e.g. 10:00"
                        />
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
