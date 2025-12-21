// stores/useShowStore.ts
import { create } from "zustand";

export type ScheduleSlot = {
  id: string;
  showTitle: string;
  startTime: string;
  endTime: string;
  description: string;
  thumbnailUrl: string;
  weekday: number;
  slug?: string;
  stationId?: string;
};

type ShowStore = {
  isOpen: boolean;
  isEditMode: boolean;
  selectedShow: ScheduleSlot | null;
  activeDay: number;
  openDialog: (show?: ScheduleSlot, weekday?: number) => void;
  closeDialog: () => void;
  setActiveDay: (day: number) => void;
};

export const useShowStore = create<ShowStore>((set) => ({
  isOpen: false,
  isEditMode: false,
  selectedShow: null,
  activeDay: 0,
  openDialog: (show, weekday) =>
    set({
      isOpen: true,
      isEditMode: !!show,
      selectedShow: show || null,
      activeDay: weekday ?? show?.weekday ?? 0,
    }),
  closeDialog: () =>
    set({
      isOpen: false,
      isEditMode: false,
      selectedShow: null,
    }),
  setActiveDay: (day) => set({ activeDay: day }),
}));
