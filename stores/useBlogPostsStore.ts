// stores/useBlogPostsStore.ts
import { create } from "zustand";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Post = {
  id: string;
  title: string;
  slug: string;
  coverImage: string;
  excerpt: string;
  category: Category | null;
  published: boolean;
  stationId: string;
  createdAt: string;
};

type CachedData = {
  posts: Post[];
  timestamp: number;
};

type BlogPostsStore = {
  // Cache by stationId
  cache: Record<string, CachedData>;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchPosts: (stationId: string, forceRefresh?: boolean) => Promise<Post[]>;
  getCachedPosts: (stationId: string) => Post[] | null;
  clearCache: (stationId?: string) => void;
  invalidateCache: (stationId: string) => void;
};

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

export const useBlogPostsStore = create<BlogPostsStore>((set, get) => ({
  cache: {},
  isLoading: false,
  error: null,

  fetchPosts: async (stationId: string, forceRefresh = false) => {
    const { cache } = get();
    const now = Date.now();

    // Check cache first (unless force refresh)
    if (!forceRefresh && cache[stationId]) {
      const cached = cache[stationId];
      if (now - cached.timestamp < CACHE_DURATION) {
        return cached.posts;
      }
    }

    set({ isLoading: true, error: null });

    try {
      const res = await fetch(`/api/blog?stationId=${stationId}`);

      if (!res.ok) {
        throw new Error(`Failed to fetch posts: ${res.statusText}`);
      }

      const data = await res.json();
      const posts: Post[] = Array.isArray(data?.posts) ? data.posts : [];

      // Update cache
      set((state) => ({
        cache: {
          ...state.cache,
          [stationId]: {
            posts,
            timestamp: now,
          },
        },
        isLoading: false,
        error: null,
      }));

      return posts;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch posts";
      set({ isLoading: false, error: errorMessage });
      return [];
    }
  },

  getCachedPosts: (stationId: string) => {
    const { cache } = get();
    const cached = cache[stationId];

    if (!cached) return null;

    // Return cached data even if stale (will refresh in background)
    return cached.posts;
  },

  clearCache: (stationId?: string) => {
    if (stationId) {
      set((state) => {
        const newCache = { ...state.cache };
        delete newCache[stationId];
        return { cache: newCache };
      });
    } else {
      set({ cache: {} });
    }
  },

  invalidateCache: (stationId: string) => {
    set((state) => {
      const cached = state.cache[stationId];
      if (cached) {
        return {
          cache: {
            ...state.cache,
            [stationId]: {
              ...cached,
              timestamp: 0, // Force refresh on next fetch
            },
          },
        };
      }
      return state;
    });
  },
}));
