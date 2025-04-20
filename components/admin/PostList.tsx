"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Post = {
  title: string;
  slug: string;
  category: string;
  coverImage: string;
  excerpt: string;
  content: string;
  published: boolean;
};

export default function PostList() {
  const [posts, setPosts] = useState<Record<string, Post>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/data/posts.json")
      .then((res) => res.json())
      .then(setPosts)
      .finally(() => setLoading(false));
  }, []);

  const postArray = Object.values(posts);

  return (
    <div className="max-w-5xl mx-auto py-6">
      <h2 className="text-xl font-bold mb-6">All Posts</h2>
      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : postArray.length === 0 ? (
        <p className="text-muted-foreground">No posts yet.</p>
      ) : (
        <div className="space-y-4">
          {postArray.map((post) => (
            <div
              key={post.slug}
              className="bg-white p-4 rounded-lg border shadow-sm flex justify-between items-center"
            >
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">{post.title}</h3>
                <p className="text-sm text-muted-foreground">{post.category}</p>
                <Badge variant={post.published ? "default" : "outline"}>
                  {post.published ? "Published" : "Draft"}
                </Badge>
              </div>
              <Link href={`/admin/blog/${post.slug}`}>
                <Button size="sm">Edit</Button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
