"use client";

import { useRef, useState } from "react";
import { useCurrentShow } from "@/hooks/useCurrentShow";
import { useStationStore } from "@/stores/useStationStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PlayIcon, SquareIcon } from "lucide-react";
import { Badge } from "../ui/badge";

export default function LivePlayer() {
  const { selected } = useStationStore();
  if (!selected) return null; // ✅ Early return before any hooks

  const show = useCurrentShow();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const streamUrl = selected.streamUrl;

  const togglePlayback = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(streamUrl);
      audioRef.current.loop = true;
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => console.error("Audio play error:", err));
    }

    setIsPlaying(!isPlaying);
  };

  if (!show) return null;

  return (
    <Card className="mt-8 sm:mt-6 bg-white text-black relative overflow-hidden shadow-xl">
      <div className="absolute inset-0 bg-black opacity-20 z-0" />
      <CardHeader className="relative z-10">
        <Badge variant="destructive" className="text-xs font-semibold animate-pulse">
          ON AIR NOW
        </Badge>
        <p className="text-sm text-muted-foreground">{show.startTime} – {show.endTime}</p>
      </CardHeader>
      <CardContent className="flex items-center gap-4 relative z-10">
        <div className="relative">
          <img src={show.thumbnailUrl} alt={show.showTitle} className="w-24 h-24 rounded-lg object-cover" />
          <button
            onClick={togglePlayback}
            className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg hover:bg-black/60 transition"
          >
            {isPlaying ? <SquareIcon className="text-white w-6 h-6" /> : <PlayIcon className="text-white w-6 h-6" />}
          </button>
        </div>
        <div>
          <p className="text-xl font-bold">{show.showTitle}</p>
          <p className="text-sm text-muted-foreground">{show.description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
