"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useBlogStore } from "@/stores/useBlogStore";
import PostDialog from "./PostDialog";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  coverImage?: string;
  published: boolean;
};

interface BlogManagerProps {
  station: { id: string; name: string };
}

export default function BlogManager({ station }: BlogManagerProps) {
  const { openDialog } = useBlogStore();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!station) return;

    setLoading(true);
    fetch(`/api/blog?stationId=${station.id}`)
      .then((res) => res.json())
      .then((data: BlogPost[]) => {
        const sorted = [...data].sort((a, b) => b.id.localeCompare(a.id));
        setPosts(sorted);
      })
      .finally(() => setLoading(false));
  }, [station]);

  if (!station) return <p className="text-muted-foreground">No station selected.</p>;

  return (
    <div className="space-y-6 bg-background text-foreground p-4 rounded-lg">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Blog Posts for {station.name}</h2>
        <Button variant="outline" onClick={() => openDialog()}>+ Create Post</Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading posts...</p>
      ) : posts.length === 0 ? (
        <p className="text-muted-foreground">No posts yet.</p>
      ) : (
        <div className="grid gap-4">
          {posts.map((post) => (
            <div
              key={post.id}
              onClick={() => openDialog(post)}
              className="p-4 border rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/70 transition flex items-start gap-4"
            >
              {post.coverImage && (
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-16 h-16 rounded object-cover border"
                />
              )}
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{post.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {post.category} · {post.slug}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-nowrap">
                    {post.published ? "✅ Published" : "🚫 Unpublished"}
                  </p>
                </div>
                <p className="text-sm mt-1 text-muted-foreground line-clamp-2">
                  {post.excerpt}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <PostDialog />
    </div>
  );
}
