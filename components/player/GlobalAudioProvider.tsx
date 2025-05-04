

// ✅ 2. GlobalAudioProvider.tsx
"use client";
import { useEffect, useRef } from "react";
import { useStationStore } from "@/stores/useStationStore";
import { useGlobalAudio } from "@/stores/useGlobalAudio";

export default function GlobalAudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { selected } = useStationStore();
  const { setAudio, setPlaying } = useGlobalAudio();

  useEffect(() => {
    if (!selected) return;

    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;

      audioRef.current.addEventListener("play", () => setPlaying(true));
      audioRef.current.addEventListener("pause", () => setPlaying(false));

      setAudio(audioRef.current);
    }

    if (audioRef.current.src !== selected.streamUrl) {
      audioRef.current.src = selected.streamUrl;
    }
  }, [selected, setAudio, setPlaying]);

  return (
    <>
      {children}
      <audio ref={audioRef} hidden />
    </>
  );
}