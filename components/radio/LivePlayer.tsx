"use client";

import { useCurrentShow } from "@/hooks/useCurrentShow";
import { useStationStore } from "@/stores/useStationStore";
import { useGlobalAudio } from "@/stores/useGlobalAudio";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { PlayIcon, SquareIcon } from "lucide-react";
import { Badge } from "../ui/badge";
import { StationSelect } from "@/components/station/StationSelect";

export default function LivePlayer() {
  const { selected } = useStationStore();
  const { isPlaying, togglePlayback } = useGlobalAudio();
  const show = useCurrentShow();

  if (!selected || !show) return null;

  return (
    <Card className="mt-8 sm:mt-6 relative overflow-hidden shadow-xl bg-background/80 backdrop-blur-md dark:bg-gradient-to-br dark:from-[#111] dark:to-[#222] text-foreground rounded-2xl">
      <div className="absolute inset-0 bg-black/10 dark:bg-black/30 z-0" />

      <CardHeader className="relative z-10 space-y-2">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex items-center gap-1 truncate">
              <StationSelect />
            </div>
          </div>

          <div className="inline-flex items-center bg-destructive text-white text-xs font-semibold rounded-md px-3 py-1 whitespace-nowrap">
            ON AIR NOW
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex items-center gap-4 relative z-10">
        <div className="relative">
          <img
            src={show.thumbnailUrl}
            alt={show.showTitle}
            className="w-24 h-24 rounded-lg object-cover"
          />
          <button
            onClick={togglePlayback}
            className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg hover:bg-black/60 transition"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <SquareIcon className="text-white w-9 h-9 fill-current" />
            ) : (
              <PlayIcon className="text-white w-9 h-9 fill-current" />
            )}
          </button>
        </div>

        <div className="overflow-hidden space-y-1">
          <p className="text-lg sm:text-xl font-bold truncate">{show.showTitle}</p>
          <p className="text-sm text-muted-foreground truncate">{show.description}</p>
          <p className="text-xs text-muted-foreground">{show.startTime} – {show.endTime}</p>
        </div>
      </CardContent>
    </Card>
  );
}
