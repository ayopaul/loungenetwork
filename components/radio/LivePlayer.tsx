"use client";

import { useCurrentShow } from "@/hooks/useCurrentShow";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PlayIcon } from "lucide-react";
import { Badge } from "../ui/badge";

export default function LivePlayer() {
  const show = useCurrentShow();

  if (!show) return <div className="text-white">No live show right now</div>;

  return (
    <Card className="mt-8 sm:mt-6 bg-secondary text-black relative overflow-hidden shadow-xl">
      <div className="absolute inset-0 opacity-10 bg-[url('/waveform.svg')] bg-cover bg-center animate-pulse z-0" />
      
      <CardHeader className="relative z-10">
      <Badge
                                variant="destructive"
                                className="text-xs font-semibold animate-pulse"
                            >
                                ON AIR NOW
                            </Badge>
        <p className="text-sm text-muted-foreground">{show.startTime} – {show.endTime}</p>
      </CardHeader>

      <CardContent className="flex items-center gap-4 relative z-10">
        <div className="relative">
          <img
            src={show.thumbnailUrl}
            alt={show.showTitle}
            className="w-24 h-24 rounded-lg object-cover"
          />
          <button className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg hover:bg-black/60 transition">
            <PlayIcon className="text-white w-6 h-6" />
          </button>
        </div>

        <div>
          <p className="text-xl font-bold">{show.showTitle}</p>
          <p className="text-sm text-muted-foreground">{show.description}</p>
        </div>
        <div className="absolute inset-0 bg-[url('/banknote.svg')] bg-repeat bg-center opacity-10 bg-blend-overlay" />
      </CardContent>
    </Card>
  );
}