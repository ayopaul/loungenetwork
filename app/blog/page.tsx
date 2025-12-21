//app/blog/page.tsx
'use client';

import { useStationStore } from "@/stores/useStationStore";
import { useBlogPostsStore } from "@/stores/useBlogPostsStore";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Skeleton } from "@/components/ui/skeleton";

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
};

// Skeleton card for loading state
function PostCardSkeleton() {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Skeleton className="w-full h-40" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

export default function BlogIndexPage() {
  const { selected } = useStationStore();
  const { fetchPosts, getCachedPosts, isLoading } = useBlogPostsStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    if (!selected) return;

    // Try to get cached posts first for instant display
    const cached = getCachedPosts(selected.id);
    if (cached) {
      setPosts(cached);
      setInitialLoad(false);
    }

    // Fetch fresh data (will use cache if valid, otherwise fetch)
    fetchPosts(selected.id).then((freshPosts) => {
      setPosts(freshPosts);
      setInitialLoad(false);
    });
  }, [selected, fetchPosts, getCachedPosts]);

  const publishedPosts = posts.filter((post) => post.published);
  const showLoading = initialLoad && isLoading;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-10">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">All Blog Posts</h1>
          {isLoading && !initialLoad && (
            <p className="text-sm text-muted-foreground">Refreshing...</p>
          )}
        </header>

        {/* Loading state with skeletons */}
        {showLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <PostCardSkeleton key={i} />
            ))}
          </div>
        ) : publishedPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No published posts found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {publishedPosts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="border rounded-lg overflow-hidden hover:bg-muted transition group"
              >
                {post.coverImage ? (
                  <div className="relative w-full h-40">
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
                      className="object-cover group-hover:opacity-90 transition"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="w-full h-40 bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground text-sm">No image</span>
                  </div>
                )}
                <div className="p-4">
                  <p className="text-sm text-muted-foreground uppercase mb-1">
                    {post.category?.name || 'Uncategorized'}
                  </p>
                  <h2 className="font-semibold text-lg line-clamp-1">{post.title}</h2>
                  <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
