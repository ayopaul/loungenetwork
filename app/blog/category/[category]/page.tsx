// app/blog/category/[category]/page.tsx

import fs from "fs/promises";
import path from "path";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";
import React from "react";
import { Metadata } from "next";

// --- Types ---
type Post = {
  id: string;
  title: string;
  slug: string;
  coverImage: string;
  excerpt: string;
  content: string;
  category: string;
  published: boolean;
};

// --- SEO ---
export async function generateMetadata(
  props: {
    params?: Promise<{ category: string }>;
    searchParams?: Promise<any>;
  }
): Promise<Metadata> {
  const params = await props.params;
  const title = params?.category
    ? `Category: ${params.category}`
    : "Blog Category";
  return { title };
}

// --- Data Fetch ---
async function getPostsByCategory(category: string): Promise<Post[]> {
  const filePath = path.join(process.cwd(), "data", "posts.json");
  const raw = await fs.readFile(filePath, "utf-8");
  const all = JSON.parse(raw);
  const posts: Post[] = [];
  for (const stationId in all) {
    for (const p of Object.values(all[stationId])) {
      const post = p as Post;
      if (post.published && post.category === category) {
        posts.push(post);
      }
    }
  }
  return posts;
}

// --- Page Component ---
export default async function CategoryPage(
  props: {
    params?: Promise<{ category: string }>;
    searchParams?: Promise<any>;
  }
) {
  const params = await props.params;
  if (!params) {
    return notFound();
  }

  const posts = await getPostsByCategory(params.category);
  if (posts.length === 0) {
    return notFound();
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-foreground px-4 py-10">
        <h1 className="text-3xl font-bold mb-6">
          Posts in “{params.category}”
        </h1>
        <ul className="space-y-4">
          {posts.map((post) => (
            <li key={post.id}>
              <Link
                href={`/blog/${post.slug}`}
                className="text-xl text-blue-600 hover:underline"
              >
                {post.title}
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
