"use client";

import { useEffect, useState } from "react";

type Show = {
  id: string;
  showTitle: string;
  startTime: string;
  endTime: string;
  description: string;
  thumbnailUrl: string;
  weekday: number;
};

export function useCurrentShow(): Show | null {
  const [currentShow, setCurrentShow] = useState<Show | null>(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      const res = await fetch("/api/schedule");
      const data: Show[] = await res.json();

      const now = new Date();
      const currentWeekday = now.getDay(); // Sunday = 0
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      const todayShows = data.filter((s) => s.weekday === currentWeekday);

      const show = todayShows.find((slot) => {
        const [sh, sm] = slot.startTime.split(":").map(Number);
        const [eh, em] = slot.endTime.split(":").map(Number);
        const start = sh * 60 + sm;
        const end = eh * 60 + em;

        // Handle overnight show e.g. 20:00 – 00:00
        if (end <= start) {
          return currentMinutes >= start || currentMinutes < end;
        }

        return currentMinutes >= start && currentMinutes < end;
      });

      setCurrentShow(show || null);
    };

    fetchSchedule();
    const interval = setInterval(fetchSchedule, 60 * 1000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  return currentShow;
}
