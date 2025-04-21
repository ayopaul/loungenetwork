import { create } from "zustand";

type Station = {
  id: string;
  name: string;
  streamUrl: string;
};

type StationAdminState = {
  isOpen: boolean;
  isEditMode: boolean;
  selectedStation: Station | null;
  openDialog: (station?: Station) => void;
  closeDialog: () => void;
};

export const useStationAdminStore = create<StationAdminState>((set) => ({
  isOpen: false,
  isEditMode: false,
  selectedStation: null,

  openDialog: (station) =>
    set({
      isOpen: true,
      isEditMode: !!station,
      selectedStation: station || null,
    }),

  closeDialog: () =>
    set({
      isOpen: false,
      isEditMode: false,
      selectedStation: null,
    }),
}));
