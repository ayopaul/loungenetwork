"use client";

import { useCurrentShow } from "@/hooks/useCurrentShow";
import { useStationStore } from "@/stores/useStationStore";
import { useGlobalAudio } from "@/stores/useGlobalAudio";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { PlayIcon, SquareIcon } from "lucide-react";
import { StationSelect } from "@/components/station/StationSelect";

export default function LivePlayer() {
  const { selected } = useStationStore();
  const { isPlaying, togglePlayback } = useGlobalAudio();
  const show = useCurrentShow();

  if (!selected || !show) return null;

  return (
    <Card className="bg-[linear-gradient(129deg,#E83273,#E43240,#DC4C24,#BD271A,#991E2F)] text-white shadow-lg rounded-2xl border-0">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <StationSelect />

          <span className="bg-red-500 text-white text-xs font-medium rounded-md px-2.5 py-1 whitespace-nowrap">
            ON AIR NOW
          </span>
        </div>
      </CardHeader>

      <CardContent className="flex items-center gap-4">
        <div className="relative w-[30vw] max-w-[96px] aspect-square rounded-lg overflow-hidden">
          <img
            src={show.thumbnailUrl}
            alt={show.showTitle}
            className="w-full h-full object-cover"
          />
          <button
            onClick={togglePlayback}
            className="absolute inset-0 bg-black/30 hover:bg-black/40 transition rounded-lg flex items-center justify-center"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <SquareIcon className="text-white w-8 h-8 fill-white" />
            ) : (
              <PlayIcon className="text-white w-8 h-8 fill-white" />
            )}
          </button>
        </div>

        <div className="space-y-1 overflow-hidden">
          <p className="text-lg font-semibold truncate">{show.showTitle}</p>
          <p className="text-sm text-white/70 truncate">{show.description}</p>
          <p className="text-xs text-white/60">
            {show.startTime} – {show.endTime}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
