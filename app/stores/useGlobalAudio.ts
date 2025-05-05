// stores/useGlobalAudio.ts
// stores/useGlobalAudio.ts
import { create } from "zustand";

interface GlobalAudioState {
  audio: HTMLAudioElement | null;
  isPlaying: boolean;
  hasError: boolean;
  volume: number;
  muted: boolean;
  setAudio: (a: HTMLAudioElement) => void;
  setPlaying: (p: boolean) => void;
  setError: (e: boolean) => void;
  setVolume: (v: number) => void;
  setMute: (m: boolean) => void;
  toggleMute: () => void;
  togglePlayback: () => void;
}

export const useGlobalAudio = create<GlobalAudioState>((set, get) => ({
  audio: null,
  isPlaying: false,
  hasError: false,
  volume: 1,
  muted: false,
  setAudio: (a) => set({ audio: a, hasError: false }),
  setPlaying: (p) => set({ isPlaying: p }),
  setError: (e) => set({ hasError: e }),
  setVolume: (v) => {
    const aud = get().audio;
    if (aud) aud.volume = v;
    set({ volume: v });
  },
  setMute: (m) => {
    const aud = get().audio;
    if (aud) aud.muted = m;
    set({ muted: m });
  },
  toggleMute: () => {
    const m = !get().muted;
    get().setMute(m);
  },
  togglePlayback: () => {
    const { audio, isPlaying } = get();
    if (!audio || get().hasError) return;
    if (isPlaying) audio.pause();
    else audio.play().catch(() => set({ hasError: true }));
    set({ isPlaying: !isPlaying });
  },
}));






