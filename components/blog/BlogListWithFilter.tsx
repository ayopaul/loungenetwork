'use client';

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox"; // or your custom-combo setup

type Post = {
  id: string;
  title: string;
  slug: string;
  coverImage: string;
  excerpt: string;
  category: string;
  published: boolean;
};

export default function BlogListWithFilter({
  posts,
  categories,
}: {
  posts: Post[];
  categories: string[];
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const filtered = selectedCategory === "All"
    ? posts
    : posts.filter(p => p.category === selectedCategory);

  return (
    <div className="space-y-6">
      <div className="w-full max-w-sm">
        <Combobox
          options={["All", ...categories]}
          value={selectedCategory}
          onChange={setSelectedCategory}
          placeholder="Filter by category..."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filtered.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="border rounded-lg overflow-hidden hover:bg-muted transition"
          >
            {post.coverImage && (
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-40 object-cover"
              />
            )}
            <div className="p-4">
              <p className="text-sm text-primary underline underline-offset-2 mb-1">
                {post.category}
              </p>
              <h2 className="font-semibold text-lg line-clamp-1">{post.title}</h2>
              <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
