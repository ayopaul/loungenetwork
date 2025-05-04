import { create } from "zustand";
import { useStationStore } from "@/stores/useStationStore";

interface GlobalAudioState {
  audio: HTMLAudioElement | null;
  isPlaying: boolean;
  volume: number;
  muted: boolean;
  currentTime: number;
  duration: number;
  setAudio: (audio: HTMLAudioElement) => void;
  togglePlayback: () => void;
  setVolume: (value: number) => void;
  toggleMute: () => void;
  updateProgress: () => void;
  setPlaying: (value: boolean) => void;
}

export const useGlobalAudio = create<GlobalAudioState>((set, get) => {
  let sharedAudio: HTMLAudioElement | null = null;

  return {
    audio: null,
    isPlaying: false,
    volume: 1,
    muted: false,
    currentTime: 0,
    duration: 0,

    setAudio: (audio) => {
      sharedAudio = audio;
      sharedAudio.loop = true;
      sharedAudio.volume = get().volume;
      sharedAudio.muted = get().muted;

      sharedAudio.ontimeupdate = () => {
        set({
          currentTime: sharedAudio?.currentTime || 0,
          duration: sharedAudio?.duration || 0,
        });
      };

      set({ audio: sharedAudio });
    },

    togglePlayback: () => {
      const { isPlaying } = get();
      const { selected } = useStationStore.getState();

      if (!selected || !selected.streamUrl) {
        console.warn("No station or stream URL selected.");
        return;
      }

      if (!sharedAudio) {
        sharedAudio = new Audio(selected.streamUrl);
        sharedAudio.loop = true;
        get().setAudio(sharedAudio);
      }

      if (sharedAudio.src !== selected.streamUrl) {
        sharedAudio.src = selected.streamUrl;
      }

      if (isPlaying) {
        sharedAudio.pause();
      } else {
        sharedAudio.play().catch((err) => console.error("Playback error:", err));
      }

      set({ isPlaying: !isPlaying });
    },

    setVolume: (value) => {
      if (sharedAudio) {
        sharedAudio.volume = value;
      }

      set({ volume: value });
    },

    toggleMute: () => {
      const newMuted = !get().muted;
      if (sharedAudio) sharedAudio.muted = newMuted;
      set({ muted: newMuted });
    },

    updateProgress: () => {
      set({
        currentTime: sharedAudio?.currentTime || 0,
        duration: sharedAudio?.duration || 0,
      });
    },

    setPlaying: (value) => set({ isPlaying: value }),
  };
});
