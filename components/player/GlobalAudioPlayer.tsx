"use client";

import { useState, useRef, useEffect } from "react";
import { PlayIcon, PauseIcon, Volume2Icon } from "lucide-react";

const streamUrl = "https://lounge877fmlagos-atunwadigital.streamguys1.com/lounge877fmlagos";

export default function GlobalAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    audioRef.current = new Audio(streamUrl);
    audioRef.current.volume = volume;
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => console.error("Playback error:", err));
    }

    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (audioRef.current) audioRef.current.volume = vol;
  };

  return (
    <div className="fixed bottom-0 w-full bg-white border-t z-50 shadow-md px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button onClick={togglePlay} className="bg-black text-white rounded-full p-2">
          {isPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
        </button>
        <span className="text-sm font-medium">Now Playing: Lounge 87.7 FM</span>
      </div>
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
  );
}
