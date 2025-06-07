//shows the player at the bottom of the screen 
"use client";

import { useCurrentShow } from "@/hooks/useCurrentShow";
import { useStationStore } from "@/stores/useStationStore";
import { useGlobalAudio } from "@/stores/useGlobalAudio";
import { PlayIcon, SquareIcon, Volume2Icon, VolumeXIcon, ImageIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export default function PlayerDock() {
  const { selected } = useStationStore();
  const show = useCurrentShow();
  const [imageError, setImageError] = useState(false);
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
    <div className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-lg bg-background/70 border-t-[1.0px] border-[#E83273] text-foreground px-4 py-2 flex items-center justify-between shadow-md">
      {/* Show Info */}
      <div className="flex items-center gap-3 overflow-hidden">
        {!imageError && show.thumbnailUrl ? (
          <Image
            src={show.thumbnailUrl}
            alt={show.showTitle}
            width={48}
            height={48}
            className="rounded-md object-cover w-12 h-12"
            onError={() => setImageError(true)}
            unoptimized // Add this if you're having optimization issues
          />
        ) : (
          <div className="w-12 h-12 rounded-md bg-gray-200 flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-gray-400" />
          </div>
        )}
        <div className="truncate">
          <p className="text-sm font-medium truncate">{show.showTitle}</p>
          <p className="text-[13px] text-foreground font-normal leading-tight tracking-normal truncate">{show.startTime} – {show.endTime}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        {/* Play/Pause */}
        <button
          onClick={togglePlayback}
          className="p-2 rounded-full bg-white text-[#ea001d] hover:bg-white/90 transition"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <SquareIcon className="w-5 h-5 fill-current" />
          ) : (
            <PlayIcon className="w-5 h-5  fill-current" />
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