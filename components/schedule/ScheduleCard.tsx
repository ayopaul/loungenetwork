// components/schedule/ScheduleCard.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type ScheduleCardProps = {
  title: string;
  description: string;
  thumbnailUrl: string;
  startTime: string;
  endTime: string;
  isLive?: boolean;
};

export default function ScheduleCard({
  title,
  description,
  thumbnailUrl,
  startTime,
  endTime,
  isLive = false,
}: ScheduleCardProps) {
  return (
    <div className="w-full max-w-[360px] mx-auto">
      <Card
        className={`relative overflow-hidden rounded-xl p-0 border border-white/10 transition duration-200 ${
          isLive ? "ring-2 ring-red-500" : "hover:shadow-lg shadow-none"
        }`}
      >
        {/* Thumbnail */}
        <div className="relative aspect-square w-full">
          <img
            src={thumbnailUrl}
            alt={title}
            className="object-cover w-full h-full"
          />
          {isLive && (
            <div className="absolute top-2 left-2">
              <Badge
                variant="destructive"
                className="text-[10px] font-semibold animate-pulse px-2 py-1"
              >
                ON AIR NOW
              </Badge>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="mt-2 px-2 pb-3 text-left">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold mt-0.5">{title}</h3>
            <p className="text-xs text-muted-foreground whitespace-nowrap ml-4">
              {startTime} – {endTime}
            </p>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
      </Card>
    </div>
  );
}
