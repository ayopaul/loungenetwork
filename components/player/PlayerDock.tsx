"use client";

import { useState, useRef, useEffect } from "react";
import { useCurrentShow } from "@/hooks/useCurrentShow";
import { PlayIcon, SquareIcon, Volume2Icon } from "lucide-react";
import Image from "next/image";
import { useStationStore } from "@/stores/useStationStore";

export default function PlayerDock() {
  const { selected } = useStationStore();
  if (!selected) return null; // ✅ guard hook call

  const show = useCurrentShow();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);

  const streamUrl = selected.streamUrl;

  useEffect(() => {
    audioRef.current = new Audio(streamUrl);
    audioRef.current.loop = true;
    audioRef.current.volume = volume;
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, [streamUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(err => {
        console.error("Audio play error:", err);
      });
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (audioRef.current) audioRef.current.volume = vol;
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-md px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-3 overflow-hidden">
        <Image src={show.thumbnailUrl} alt={show.showTitle} width={48} height={48} className="rounded-md object-cover w-12 h-12" />
        <div className="truncate">
          <p className="text-sm font-medium truncate">{show.showTitle}</p>
          <p className="text-xs text-muted-foreground truncate">{show.startTime} – {show.endTime}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button onClick={togglePlay} className="p-2 rounded-full bg-black text-white hover:bg-gray-800 transition">
          {isPlaying ? <SquareIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
        </button>
        <div className="flex items-center gap-2">
          <Volume2Icon className="w-4 h-4 text-muted-foreground" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="w-24"
          />
        </div>
      </div>
    </div>
  );
}
