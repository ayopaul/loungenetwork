import { useEffect, useState } from "react";

let audio: HTMLAudioElement | null = null;

export function useAudio(streamUrl: string) {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!audio) {
      audio = new Audio(streamUrl);
      audio.crossOrigin = "anonymous";
      audio.loop = true;
    }
  }, [streamUrl]);

  const togglePlayback = () => {
    if (!audio) return;

    if (audio.paused) {
      audio.play().then(() => setIsPlaying(true)).catch(console.error);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  return {
    audioRef: audio,
    isPlaying,
    togglePlayback,
  };
}
