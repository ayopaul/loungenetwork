

// ✅ 2. GlobalAudioProvider.tsx
"use client";
import { useEffect, useRef } from "react";
import { useStationStore } from "@/stores/useStationStore";
import { useGlobalAudio } from "@/stores/useGlobalAudio";

export default function GlobalAudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const initializedRef = useRef(false);
  const { selected } = useStationStore();
  const { setAudio, setPlaying } = useGlobalAudio();

  useEffect(() => {
    // audioRef.current is the real <audio ref={audioRef} hidden /> element
    // rendered below -- React attaches refs during commit, before this
    // effect runs, so it's already non-null by the time we get here. The
    // `if (!audioRef.current)` check this replaced was meant to gate a
    // one-time setup (and used to also *create* a brand new Audio() as a
    // fallback), but since audioRef.current was never actually falsy,
    // that branch never ran -- setAudio() never fired, the shared store's
    // `sharedAudio` stayed null, and togglePlayback() silently fell back
    // to creating its own separate, detached Audio() instead of using
    // this one. Gate the one-time setup on our own flag instead.
    if (!selected || !audioRef.current) return;

    if (!initializedRef.current) {
      initializedRef.current = true;
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