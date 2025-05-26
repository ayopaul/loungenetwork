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
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!selected?.id) {
      setSchedule([]);
      setLoading(false);
      return;
    }

    const fetchSchedule = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/schedule?stationId=${selected.id}`);
        const text = await res.text();
        const data = text ? JSON.parse(text) : [];

        setSchedule(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error("Failed to fetch schedule:", err);
        setError(err);
        setSchedule([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [selected]);

  return { schedule, loading, error };
}