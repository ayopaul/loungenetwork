"use client";

import { useCurrentShow } from "@/hooks/useCurrentShow";
import { useStationStore } from "@/stores/useStationStore";
import { useGlobalAudio } from "@/stores/useGlobalAudio";
import { PlayIcon, SquareIcon, Volume2Icon, VolumeXIcon } from "lucide-react";
import Image from "next/image";

export default function PlayerDock() {
  const { selected } = useStationStore();
  const show = useCurrentShow();
  const {
    isPlaying,
    togglePlayback,
    volume,
    setVolume,
    muted,
    toggleMute
  } = useGlobalAudio();

  if (!selected || !show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-md px-4 py-2 flex items-center justify-between">
      {/* Show Info */}
      <div className="flex items-center gap-3 overflow-hidden">
        <Image
          src={show.thumbnailUrl}
          alt={show.showTitle}
          width={48}
          height={48}
          className="rounded-md object-cover w-12 h-12"
        />
        <div className="truncate">
          <p className="text-sm font-medium truncate">{show.showTitle}</p>
          <p className="text-xs text-muted-foreground truncate">{show.startTime} – {show.endTime}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        {/* Play/Pause */}
        <button
          onClick={togglePlayback}
          className="p-2 rounded-full bg-black text-white hover:bg-gray-800 transition"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <SquareIcon className="w-5 h-5 fill-white" />
          ) : (
            <PlayIcon className="w-5 h-5 fill-white" />
          )}
        </button>

        {/* Volume controls (only after play starts) */}
        {isPlaying && (
          <div className="flex items-center gap-2">
            <button onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"}>
              {muted ? (
                <VolumeXIcon className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Volume2Icon className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-24"
            />
          </div>
        )}
      </div>
    </div>
  );
}
