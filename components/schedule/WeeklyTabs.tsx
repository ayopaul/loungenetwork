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


// use number strings to match the API: 0 (Sunday) to 6 (Saturday)
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
    <Tabs defaultValue={today} className="w-full">
      <TabsList className="flex w-full overflow-x-auto no-scrollbar justify-start gap-1 sm:gap-2 px-1 sm:px-0">
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

      {weekdays.map((day) => {
        const shows = schedule.filter((s) => String(s.weekday) === day.value);

        return (
          <TabsContent key={day.value} value={day.value}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-center">
              {shows.map((slot) => {
                const now = new Date();
                const currentMinutes = now.getHours() * 60 + now.getMinutes();

                const [sh, sm] = slot.startTime.split(":").map(Number);
                const [eh, em] = slot.endTime.split(":").map(Number);
                const start = sh * 60 + sm;
                const end = eh * 60 + em;
                const isLive = end <= start
                  ? currentMinutes >= start || currentMinutes < end
                  : currentMinutes >= start && currentMinutes < end;

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
