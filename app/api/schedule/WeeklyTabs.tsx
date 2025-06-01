
"use client";

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useSchedule } from "@/hooks/useSchedule";
import ScheduleCard from "@/components/schedule/ScheduleCard";
import { useStationStore } from "@/stores/useStationStore";
import { useRef, useEffect } from "react";

const weekdays = [
  { label: "Sunday", value: "0" },
  { label: "Monday", value: "1" },
  { label: "Tuesday", value: "2" },
  { label: "Wednesday", value: "3" },
  { label: "Thursday", value: "4" },
  { label: "Friday", value: "5" },
  { label: "Saturday", value: "6" },
];

const today = new Date().getDay().toString();

const carouselRefs: { current: (HTMLDivElement | null)[] } = { current: [] };

export default function WeeklyTabs() {
  const { selected } = useStationStore();
  const { schedule, loading } = useSchedule();

  useEffect(() => {
    const todayIndex = weekdays.findIndex((d) => d.value === today);
    const container = carouselRefs.current[todayIndex];
    if (!container || schedule.length === 0) return;
    const liveEl = container.querySelector('[data-live-show="true"]');
    if (liveEl) {
      liveEl.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
    }
  }, [schedule]);

  if (loading || !selected) {
    return <div className="text-white">{loading ? "Loading schedule..." : "No station selected."}</div>;
  }

  if (carouselRefs.current.length !== weekdays.length) {
    carouselRefs.current = Array(weekdays.length).fill(null);
  }

  return (
    <Tabs defaultValue={today} className="w-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-semibold shrink-0">Weekly Schedule</h2>
        <TabsList className="flex overflow-x-auto no-scrollbar justify-start md:justify-end gap-1 sm:gap-2 px-2 w-full md:w-auto">
          {weekdays.map((day) => (
            <TabsTrigger key={day.value} value={day.value} className="whitespace-nowrap">
              {day.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {weekdays.map((day, index) => {
        const shows = schedule.filter((s) => String(s.weekday) === day.value);
        return (
          <TabsContent key={day.value} value={day.value} className="pb-4">
            <div className="relative w-full px-4 sm:px-6 py-6">
              <Carousel className="w-full">
                <CarouselContent
                  ref={(el) => { carouselRefs.current[index] = el }}
                  className="flex gap-4 no-scrollbar"
                >
                  {shows.map((slot) => {
                    const now = new Date();
                    const todayDay = now.getDay().toString();
                    const currentMinutes = now.getHours() * 60 + now.getMinutes();
                    const [sh, sm] = slot.startTime.split(":").map(Number);
                    const [eh, em] = slot.endTime.split(":").map(Number);
                    const start = sh * 60 + sm;
                    const end = eh * 60 + em;
                    const isToday = todayDay === day.value;
                    const isDuringShow = end <= start
                      ? currentMinutes >= start || currentMinutes < end
                      : currentMinutes >= start && currentMinutes < end;
                    const isLive = isToday && isDuringShow;
                    const slug = slot.showTitle.toLowerCase().replace(/\s+/g, "-");

                    return (
                      <CarouselItem
                        key={slot.id}
                        className="basis-1/2 md:basis-1/3 lg:basis-1/4 min-w-[200px] flex-shrink-0"
                        id={`show-${slug}`}
                        data-live-show={isLive ? "true" : undefined}
                      >
                        <ScheduleCard
                          title={slot.showTitle}
                          description={slot.description}
                          thumbnailUrl={slot.thumbnailUrl}
                          startTime={slot.startTime}
                          endTime={slot.endTime}
                          isLive={isLive}
                        />
                      </CarouselItem>
                    );
                  })}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
