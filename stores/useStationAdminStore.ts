// stores/useStationAdminStore.ts
import { create } from "zustand";

export type Station = {
  id: string;
  name: string;
  streamUrl: string;
};

type StationAdminStore = {
  isOpen: boolean;
  isEditMode: boolean;
  selectedStation: Station | null;
  openDialog: (station?: Station) => void;
  closeDialog: () => void;
};

export const useStationAdminStore = create<StationAdminStore>((set) => ({
  isOpen: false,
  isEditMode: false,
  selectedStation: null,
  openDialog: (station) =>
    set({
      isOpen: true,
      isEditMode: !!station,
      selectedStation: station || null,
    }),
  closeDialog: () => set({ isOpen: false, selectedStation: null }),
}));
