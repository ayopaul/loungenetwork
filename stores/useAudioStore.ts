// stores/useAudioStore.ts
import { create } from "zustand";

interface AudioState {
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
}

export const useAudioStore = create<AudioState>()((set) => ({
  isPlaying: false,
  setIsPlaying: (isPlaying) => set({ isPlaying }),
}));
