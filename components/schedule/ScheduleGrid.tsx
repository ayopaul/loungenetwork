"use client";

import { useSchedule } from "@/hooks/useSchedule";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function ScheduleGrid() {
  const { schedule, loading } = useSchedule();

  if (loading) return <div className="text-white">Loading schedule...</div>;

  return (
    <div id="schedule" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {schedule.map((slot) => (
        <Card key={slot.id} className="bg-white text-black">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">{slot.showTitle}</CardTitle>
            <p className="text-xs text-muted-foreground">{slot.startTime} – {slot.endTime}</p>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{slot.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
