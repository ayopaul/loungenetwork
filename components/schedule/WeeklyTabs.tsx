"use client";

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { useSchedule } from "@/hooks/useSchedule";
import ScheduleCard from "@/components/schedule/ScheduleCard";
import { useStationStore } from "@/stores/useStationStore";

// weekdays and today
const weekdays = [
  { label: "Sunday", value: "0" },
  { label: "Monday", value: "1" },
  { label: "Tuesday", value: "2" },
  { label: "Wednesday", value: "3" },
  { label: "Thursday", value: "4" },
  { label: "Friday", value: "5" },
  { label: "Saturday", value: "6" },
];
const today = new Date().getDay().toString(); // 0–6

export default function WeeklyTabs() {
  const { selected } = useStationStore();
  if (!selected) return null;

  const { schedule, loading } = useSchedule();
  if (loading) return <div className="text-white">Loading schedule...</div>;

  return (
    <Tabs defaultValue={today} className="w-full space-y-6">

      {/* Top Bar: Title (left) + Tabs (right) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-semibold shrink-0">Weekly Schedule</h2>

        {/* TabsList aligned to the right */}
        <TabsList className="flex overflow-x-auto no-scrollbar justify-start md:justify-end gap-1 sm:gap-2 px-2 w-full md:w-auto">
          {weekdays.map((day) => (
            <TabsTrigger
              key={day.value}
              value={day.value}
              className="whitespace-nowrap"
            >
              {day.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {/* Grid below */}
      {weekdays.map((day) => {
        const shows = schedule.filter((s) => String(s.weekday) === day.value);

        return (
          <TabsContent key={day.value} value={day.value}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-center">
              {shows.map((slot) => {
                const now = new Date();
                const todayDay = now.getDay().toString(); // current day of week
                const currentMinutes = now.getHours() * 60 + now.getMinutes();

                const [sh, sm] = slot.startTime.split(":").map(Number);
                const [eh, em] = slot.endTime.split(":").map(Number);
                const start = sh * 60 + sm;
                const end = eh * 60 + em;

                // Corrected isLive logic:
                const isToday = todayDay === day.value;
                const isDuringShow = end <= start
                  ? currentMinutes >= start || currentMinutes < end // handle shows crossing midnight
                  : currentMinutes >= start && currentMinutes < end;

                const isLive = isToday && isDuringShow; // ✅ Must match BOTH today and correct time

                return (
                  <ScheduleCard
                    key={slot.id}
                    title={slot.showTitle}
                    description={slot.description}
                    thumbnailUrl={slot.thumbnailUrl}
                    startTime={slot.startTime}
                    endTime={slot.endTime}
                    isLive={isLive}
                  />
                );
              })}
            </div>
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
