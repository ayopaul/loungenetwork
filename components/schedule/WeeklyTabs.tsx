//components/schedule/WeeklyTabs.tsx

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
import { useRef, useEffect, useState, useCallback } from "react";
import { type CarouselApi } from "@/components/ui/carousel";

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

export default function WeeklyTabs() {
  const { selected } = useStationStore();
  const { schedule, loading } = useSchedule();
  const carouselApis = useRef<(CarouselApi | undefined)[]>([]);
  const [scrollStates, setScrollStates] = useState<{[key: number]: {canPrev: boolean, canNext: boolean}}>({});

  // Memoized function to update scroll state
  const updateScrollState = useCallback((api: CarouselApi, index: number) => {
    if (!api) return;
    
    const canPrev = api.canScrollPrev();
    const canNext = api.canScrollNext();
    
    setScrollStates(prev => {
      // Only update if values actually changed
      if (prev[index]?.canPrev === canPrev && prev[index]?.canNext === canNext) {
        return prev;
      }
      
      return {
        ...prev,
        [index]: { canPrev, canNext }
      };
    });
  }, []);

  // useEffect to scroll to live show on today's tab
  useEffect(() => {
    if (loading || !schedule.length) return;

    const todayIndex = weekdays.findIndex((d) => d.value === today);
    
    // Wait for carousel to be initialized and schedule to load
    const timer = setTimeout(() => {
      const api = carouselApis.current[todayIndex];
      if (!api || schedule.length === 0) return;

      // Find the live show index
      const shows = schedule.filter((s) => String(s.weekday) === today);
      const liveShowIndex = shows.findIndex((slot) => {
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const [sh, sm] = slot.startTime.split(":").map(Number);
        const [eh, em] = slot.endTime.split(":").map(Number);
        const start = sh * 60 + sm;
        const end = eh * 60 + em;
        const isDuringShow = end <= start
          ? currentMinutes >= start || currentMinutes < end
          : currentMinutes >= start && currentMinutes < end;
        return isDuringShow;
      });

      if (liveShowIndex !== -1) {
        api.scrollTo(liveShowIndex);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [schedule, loading]);

  if (loading || !selected) {
    return <div className="text-white">{loading ? "Loading schedule..." : "No station selected."}</div>;
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
            <div className="w-full">
              <Carousel
                className="w-full pointer-events-none md:pointer-events-auto"
                opts={{
                  align: "start",
                  skipSnaps: false,
                  dragFree: false,
                  containScroll: "trimSnaps",
                  slidesToScroll: 1,
                  loop: false,
                  // Completely disable all drag interactions
                  dragThreshold: 999,
                  startIndex: 0,
                  duration: 25,
                  watchDrag: false,
                  watchResize: true,
                }}
                setApi={(api) => {
                  carouselApis.current[index] = api;
                  
                  if (api) {
                    // Create event handler with proper cleanup
                    const handleScrollUpdate = () => updateScrollState(api, index);
                    
                    // Add event listeners
                    api.on('init', handleScrollUpdate);
                    api.on('scroll', handleScrollUpdate);
                    api.on('select', handleScrollUpdate);
                    
                    // Initial state update
                    handleScrollUpdate();
                    
                    // Cleanup function will be handled by the carousel itself
                  }
                }}
              >
                {/* Add padding to prevent red outline from being cut off */}
                <CarouselContent className="-ml-2 md:-ml-4 py-1">
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
                        className="pl-2 md:pl-4 basis-[65%] sm:basis-[48%] md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
                        id={`show-${slug}`}
                        data-live-show={isLive ? "true" : undefined}
                      >
                        {/* Add margin to prevent red outline from being cut off */}
                        <div className={`w-full max-w-[320px] mx-auto ${isLive ? 'm-1' : ''}`}>
                          <ScheduleCard
                            title={slot.showTitle}
                            description={slot.description}
                            thumbnailUrl={slot.thumbnailUrl}
                            startTime={slot.startTime}
                            endTime={slot.endTime}
                            isLive={isLive}
                          />
                        </div>
                      </CarouselItem>
                    );
                  })}
                </CarouselContent>
                <CarouselPrevious 
                  className={`left-2 pointer-events-auto ${!scrollStates[index]?.canPrev ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!scrollStates[index]?.canPrev}
                />
                <CarouselNext 
                  className={`right-2 pointer-events-auto ${!scrollStates[index]?.canNext ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!scrollStates[index]?.canNext}
                />
              </Carousel>
            </div>
          </TabsContent>
        );
      })}
    </Tabs>
  );
}