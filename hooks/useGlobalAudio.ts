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
  // This shared reference always points to the <audio> from GlobalAudioProvider
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
      const { isPlaying, audio } = get();
      const { selected } = useStationStore.getState();

      if (!selected || !selected.streamUrl || !audio) {
        console.warn("Audio element or station not ready.");
        return;
      }

      // Update stream if station changed
      if (audio.src !== selected.streamUrl) {
        audio.src = selected.streamUrl;
      }

      if (isPlaying) {
        audio.pause();
      } else {
        audio.play().catch((err) => console.error("Playback error:", err));
      }

      set({ isPlaying: !isPlaying });
    },

    setVolume: (value) => {
      if (sharedAudio) {
        sharedAudio.volume = value;
        console.log("Setting volume to:", value, "on", sharedAudio.src);
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
