// stores/useBlogStore.ts
import { create } from "zustand";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  coverImage?: string;
  published: boolean;
  stationId?: string;
  categoryId?: string;
  category?: Category | null;
  createdAt?: string;
};

type BlogStore = {
  isOpen: boolean;
  isEditMode: boolean;
  selectedPost: BlogPost | null;
  openDialog: (post?: BlogPost) => void;
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
