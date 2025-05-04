import { useEffect, useState } from "react";
import { getGlobalAudio } from "@/lib/globalAudio";
import { useStationStore } from "@/stores/useStationStore";

export function useGlobalAudio() {
  const { selected } = useStationStore();
  const streamUrl = selected?.streamUrl || "";
  const [isPlaying, setIsPlaying] = useState(false);
  const audio = getGlobalAudio(streamUrl);

  useEffect(() => {
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, [audio]);

  const toggle = () => {
    if (audio.paused) {
      audio.play().catch(console.error);
    } else {
      audio.pause();
    }
  };

  return { audio, isPlaying, toggle };
}
