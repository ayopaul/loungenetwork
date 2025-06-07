"use client";

import { useGlobalAudio } from "@/stores/useGlobalAudio";
import { useCurrentShow } from "@/hooks/useCurrentShow";
import { PlayIcon, SquareIcon, Volume2Icon, VolumeXIcon } from "lucide-react";
import Image from "next/image";

export default function PlayerBar() {
  const show = useCurrentShow();
  const {
    isPlaying,
    togglePlayback,
    volume,
    setVolume,
    muted,
    toggleMute,
  } = useGlobalAudio();

  if (!show) return null;

  return (
    
    <div className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-md bg-white/60 border-t-[1.5px] border-[#ea001d] text-black px-4 py-2 flex items-center justify-between shadow-md">
      {/* Show Info */}
      <div className="flex items-center gap-3">
        
        <Image
          src={show.thumbnailUrl}
          alt={show.showTitle}
          width={48}
          height={48}
          className="rounded-md object-cover"
        />
        <div>
          <p className="text-sm font-medium">{show.showTitle}</p>
          <p className="text-xs text-muted-foreground">{show.startTime} – {show.endTime}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        {/* Mute Toggle */}
        <button
          onClick={toggleMute}
          className="text-black hover:text-gray-700"
          aria-label={muted ? "Unmute" : "Mute"}
        >
          {muted ? <VolumeXIcon className="w-5 h-5" /> : <Volume2Icon className="w-5 h-5" />}
        </button>

        {/* Volume Slider */}
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={muted ? 0 : volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-24"
          aria-label="Volume"
        />

        {/* Play/Pause */}
        <button
          onClick={togglePlayback}
          className="p-2 rounded-full bg-black text-white hover:bg-gray-800 transition"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <SquareIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}
