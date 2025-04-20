"use client";

import { useState, useEffect } from "react";
import { useStationStore } from "@/stores/useStationStore";

export type ScheduleSlot = {
  id: string;
  showTitle: string;
  startTime: string;
  endTime: string;
  description: string;
  thumbnailUrl: string;
  weekday: number;
};

export function useSchedule() {
  const { selected } = useStationStore();
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selected?.id) return;
  
    async function fetchSchedule() {
      setLoading(true);
      try {
        const res = await fetch(`/api/schedule?stationId=${selected!.id}`);
        const data = await res.json();
        setSchedule(data);
      } catch (error) {
        console.error("Failed to fetch schedule:", error);
        setSchedule([]);
      } finally {
        setLoading(false);
      }
    }
  
    fetchSchedule();
  }, [selected]);  

  return { schedule, loading };
}