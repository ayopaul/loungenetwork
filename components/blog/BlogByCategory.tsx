'use client';

import { useEffect, useState } from "react";
import { useStationStore } from "@/stores/useStationStore";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Post = {
  id: string;
  title: string;
  slug: string;
  category: Category; // This is an object, not a string
  excerpt: string;
  coverImage: string;
  published: boolean;
};

export default function BlogByCategory({ limit = 4 }: { limit?: number }) {
  const { selected } = useStationStore();
  const [grouped, setGrouped] = useState<Record<string, Post[]>>({});

  useEffect(() => {
    if (!selected?.id) return;

    fetch(`/api/blog?stationId=${selected.id}`)
    .then((res) => res.json())
    .then((data) => {
      const posts = Array.isArray(data?.posts) ? data.posts : [];
      if (!Array.isArray(data?.posts)) {
        console.error("Fetched blog data is not an array:", data);
      }
        
      const filtered = posts.filter((p: Post) => p.published);
      const groupedByCategory = filtered.reduce((acc: Record<string, Post[]>, post: Post) => {
        // Fix: Extract category name from the category object
        const categoryName = post.category?.name || 'Uncategorized';
        
        if (!acc[categoryName]) acc[categoryName] = [];
        acc[categoryName].push(post);
        return acc;
      }, {});
      
      setGrouped(groupedByCategory);
    })
    .catch((err) => {
      console.error("Failed to load blog posts:", err);
      setGrouped({});
    });
  }, [selected]);

  if (!selected) return null;

  // Filter out any remaining undefined categories
  const validGroupedEntries = Object.entries(grouped).filter(
    ([category]) => category && category !== 'undefined'
  );

  if (validGroupedEntries.length === 0) return null;

  return (
    <section className="space-y-10">
      {validGroupedEntries.map(([category, posts]) => (
        <div key={category} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-foreground">{category}</h3>
            <Link
              href={`/blog/category/${encodeURIComponent(category)}`}
              className="text-sm text-primary underline"
            >
              View all
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {posts.slice(0, limit).map((post) => (
              <Card
                key={post.id}
                className="flex flex-col h-full p-4 bg-muted hover:bg-muted/70 transition"
              >
                {post.coverImage && (
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-36 object-cover rounded mb-3"
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-semibold text-base line-clamp-1">{post.title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                </div>
                <Link href={`/blog/${post.slug}`} className="mt-3">
                  <Button variant="link" className="px-0">Read More</Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}