// components/radio/PlayerBar.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useCurrentShow } from "@/hooks/useCurrentShow";
import { PlayIcon, SquareIcon } from "lucide-react";
import Image from "next/image";

const streamUrl = "https://lounge877fmlagos-atunwadigital.streamguys1.com/lounge877fmlagos";

export default function PlayerBar() {
  const show = useCurrentShow();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlayback = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(streamUrl);
      audioRef.current.loop = true;
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => {
        console.error("Playback failed:", err);
      });
    }

    setIsPlaying(!isPlaying);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-md px-4 py-2 flex items-center justify-between">
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

      <button
        onClick={togglePlayback}
        className="p-2 rounded-full bg-black text-white hover:bg-gray-800 transition"
      >
        {isPlaying ? <SquareIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
      </button>
    </div>
  );
}
