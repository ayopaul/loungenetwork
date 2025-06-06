//app/blog/page.tsx
'use client';

import { useStationStore } from "@/stores/useStationStore";
import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

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
  category: Category;
  published: boolean;
};

export default function BlogIndexPage() {
  const { selected } = useStationStore();
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    if (!selected) return;
    
    fetch(`/api/blog?stationId=${selected.id}`)
      .then((res) => res.json())
      .then((data) => {
        // Extract the posts array from the response
        const postsArray = Array.isArray(data?.posts) ? data.posts : [];
        setPosts(postsArray);
      })
      .catch((error) => {
        console.error('Error fetching posts:', error);
        setPosts([]);
      });
  }, [selected]);

  const publishedPosts = posts.filter((post) => post.published);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-10">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">All Blog Posts</h1>
        </header>
        
        {publishedPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No published posts found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {publishedPosts.map((post) => (
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