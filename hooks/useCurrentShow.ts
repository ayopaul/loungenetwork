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
      try {
        const res = await fetch("/api/schedule");
        
        if (!res.ok) {
          console.error(`❌ API returned ${res.status}: ${res.statusText}`);
          setCurrentShow(null);
          return;
        }

        const data = await res.json();
        
        // Check if we got an error response
        if (data.error) {
          console.error("❌ API Error:", data.error);
          setCurrentShow(null);
          return;
        }

        // Ensure we have an array
        if (!Array.isArray(data)) {
          console.error("❌ Expected array but got:", typeof data, data);
          setCurrentShow(null);
          return;
        }

        const now = new Date();
        const currentWeekday = now.getDay(); // Sunday = 0
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        const todayShows = data.filter((s: Show) => s.weekday === currentWeekday);

        const show = todayShows.find((slot: Show) => {
          const [sh, sm] = slot.startTime.split(":").map(Number);
          const [eh, em] = slot.endTime.split(":").map(Number);
          const start = sh * 60 + sm;
          const end = eh * 60 + em;

          // Handle overnight show (e.g. 20:00 – 00:00)
          if (end <= start) {
            return currentMinutes >= start || currentMinutes < end;
          }

          return currentMinutes >= start && currentMinutes < end;
        });

        setCurrentShow(show || null);
      } catch (error) {
        console.error("❌ Failed to fetch or parse schedule:", error);
        setCurrentShow(null);
      }
    };

    fetchSchedule();
    const interval = setInterval(fetchSchedule, 60 * 1000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  return currentShow;
}