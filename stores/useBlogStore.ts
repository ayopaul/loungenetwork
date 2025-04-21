// stores/useBlogStore.ts
import { create } from "zustand";

type BlogStore = {
  isOpen: boolean;
  isEditMode: boolean;
  selectedPost: any | null;
  openDialog: (post?: any) => void;
  closeDialog: () => void;
};

export const useBlogStore = create<BlogStore>((set) => ({
  isOpen: false,
  isEditMode: false,
  selectedPost: null,
  openDialog: (post) =>
    set({
      isOpen: true,
      isEditMode: !!post,
      selectedPost: post || null,
    }),
  closeDialog: () =>
    set({
      isOpen: false,
      isEditMode: false,
      selectedPost: null,
    }),
}));
