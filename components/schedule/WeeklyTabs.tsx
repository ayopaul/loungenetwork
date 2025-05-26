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
} from "@/components/ui/carousel";
import { useSchedule } from "@/hooks/useSchedule";
import ScheduleCard from "@/components/schedule/ScheduleCard";
import { useStationStore } from "@/stores/useStationStore";
import { useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

  // Helper to scroll a specific carousel by index
  const scrollBy = (direction: number, index: number) => {
    const carouselRef = carouselRefs.current[index];
    if (!carouselRef) return;
    const container = carouselRef;
    const itemWidth = container.firstElementChild?.clientWidth || 300;
    container.scrollBy({ left: direction * itemWidth, behavior: "smooth" });
  };

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
      {weekdays.map((day, index) => {
        const shows = schedule.filter((s) => String(s.weekday) === day.value);

        return (
          <TabsContent key={day.value} value={day.value} className="pb-4">
            <div>
              <Carousel opts={{ align: "start" }} className="w-full px-4 sm:px-6 py-6">
                <div className="relative">
                  <CarouselContent
                    ref={(el) => {
                      carouselRefs.current[index] = el;
                    }}
                    className="py-6 snap-x snap-mandatory overflow-x-auto scroll-smooth no-scrollbar"
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

                      // generate slug from title
                      const slug = slot.showTitle.toLowerCase().replace(/\s+/g, "-");

                      return (
                        <CarouselItem
                          key={slot.id}
                          className={`snap-start basis-1/2 md:basis-1/3 lg:basis-1/4 px-2 ${isLive ? " " : ""}`}
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
                  <button
                    onClick={() => scrollBy(-1, index)}
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 rounded-full p-2 text-white"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => scrollBy(1, index)}
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 rounded-full p-2 text-white"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </Carousel>
            </div>
          </TabsContent>
        );
      })}
    </Tabs>
  );
}