import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Station = {
  id: string;
  name: string;
  streamUrl: string;
};

type StationStore = {
  selected: Station | null;
  setSelected: (station: Station) => void;
};

export const useStationStore = create<StationStore>()(
  persist(
    (set) => ({
      selected: null,
      setSelected: (station) => set({ selected: station })
    }),
    {
      name: "selected-station", // key in localStorage
      partialize: (state) => ({ selected: state.selected })
    }
  )
);
