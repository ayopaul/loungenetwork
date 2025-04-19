"use client";

import { useState, useEffect } from "react";

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
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSchedule() {
      const res = await fetch("/api/schedule");
      const data = await res.json();
      setSchedule(data);
      setLoading(false);
    }

    fetchSchedule();
  }, []);

  return { schedule, loading };
}
