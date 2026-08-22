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

// All three stations broadcast from Nigeria (WAT, UTC+1, no DST), but a
// visitor's browser clock can be in any timezone. Deriving "now" from the
// visitor's local time made the current-show match (and therefore whether
// the player shows at all) depend on where the visitor happens to be.
// Anchor it to the station's actual timezone instead.
function getLagosNow(): { weekday: number; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Africa/Lagos",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const weekdayMap: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
  };

  let weekday = 0;
  let hour = 0;
  let minute = 0;
  for (const part of parts) {
    if (part.type === "weekday") weekday = weekdayMap[part.value] ?? 0;
    else if (part.type === "hour") hour = Number(part.value) % 24; // Intl can yield "24" for midnight
    else if (part.type === "minute") minute = Number(part.value);
  }

  return { weekday, minutes: hour * 60 + minute };
}

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

        const { weekday: currentWeekday, minutes: currentMinutes } = getLagosNow();

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