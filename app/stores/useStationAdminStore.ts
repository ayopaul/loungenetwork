import { create } from "zustand";

const savedStation = typeof window !== "undefined" ? localStorage.getItem("selected-station") : null;
const initialSelected = savedStation ? JSON.parse(savedStation) : null;

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
  selectedStation: initialSelected,

  openDialog: (station) => {
    if (station) localStorage.setItem("selected-station", JSON.stringify(station));
    set({
      isOpen: true,
      isEditMode: !!station,
      selectedStation: station || null,
    });
  },

  closeDialog: () =>
    set({
      isOpen: false,
      isEditMode: false,
      selectedStation: null,
    }),
}));


import { useEffect } from "react";

export function useHydrateStation() {
  const openDialog = useStationAdminStore((s) => s.openDialog);

  useEffect(() => {
    const saved = localStorage.getItem("selected-station");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.id && parsed?.name) openDialog(parsed);
      } catch {}
    }
  }, []);
}