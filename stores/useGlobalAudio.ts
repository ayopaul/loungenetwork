// ✅ 1. useGlobalAudio.ts
import { create } from "zustand";

interface GlobalAudioState {
  audio: HTMLAudioElement | null;
  isPlaying: boolean;
  setAudio: (audio: HTMLAudioElement) => void;
  togglePlayback: () => void;
  setPlaying: (val: boolean) => void;
}

export const useGlobalAudio = create<GlobalAudioState>((set, get) => ({
  audio: null,
  isPlaying: false,
  setAudio: (audio) => set({ audio }),
  togglePlayback: () => {
    const audio = get().audio;
    if (!audio) return;
    if (audio.paused) {
      audio.play();
      set({ isPlaying: true });
    } else {
      audio.pause();
      set({ isPlaying: false });
    }
  },
  setPlaying: (val) => set({ isPlaying: val }),
}));