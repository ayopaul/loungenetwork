'use client';

import { useStationStore } from "@/stores/useStationStore";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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

export default function CategoryPage() {
  const { selected } = useStationStore();
  const params = useParams();
  const categoryName = params?.category ? decodeURIComponent(params.category as string) : '';
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selected) {
      setLoading(false);
      setError("No station selected");
      return;
    }

    if (!categoryName) {
      setLoading(false);
      setError("No category specified");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    fetch(`/api/blog?stationId=${selected.id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        const postsArray = Array.isArray(data?.posts) ? data.posts : [];
        
        // Filter posts by category name (case-insensitive)
        const filteredPosts = postsArray.filter((post: Post) => 
          post.published && 
          post.category?.name?.toLowerCase() === categoryName.toLowerCase()
        );
        
        setPosts(filteredPosts);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching posts:', error);
        setError(error.message);
        setPosts([]);
        setLoading(false);
      });
  }, [selected, categoryName]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-10">
          <div className="text-center py-12">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-muted rounded w-32 mx-auto"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-10">
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">Error: {error}</p>
            <Link 
              href="/blog" 
              className="text-primary underline hover:no-underline"
            >
              Return to all posts
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-10">
        <header className="mb-12">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/blog" className="hover:text-foreground transition-colors">
              All Posts
            </Link>
            <span>→</span>
            <span className="text-foreground">{categoryName}</span>
          </div>
          
          {/* Page Title */}
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {categoryName}
          </h1>
          
          {/* Post Count */}
          <p className="text-muted-foreground">
            {posts.length === 0 
              ? "No posts found" 
              : `${posts.length} ${posts.length === 1 ? 'post' : 'posts'}`
            }
            {selected && (
              <span className="ml-2">• {selected.name}</span>
            )}
          </p>
        </header>
        
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <h2 className="text-xl font-semibold mb-4">No posts in this category</h2>
              <p className="text-muted-foreground mb-6">
                There are currently no published posts in the "{categoryName}" category
                {selected && ` for ${selected.name}`}.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/blog" 
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  View all posts
                </Link>
                <Link 
                  href="/" 
                  className="px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
                >
                  Go to homepage
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {posts.map((post) => (
              <article
                key={post.id}
                className="group"
              >
                <Link
                  href={`/blog/${post.slug}`}
                  className="block border rounded-lg overflow-hidden hover:bg-muted transition-all duration-200 hover:shadow-lg"
                >
                  {post.coverImage && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <p className="text-sm text-primary font-medium mb-2">
                      {post.category?.name || 'Uncategorized'}
                    </p>
                    <h2 className="font-semibold text-lg line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {post.excerpt}
                      </p>
                    )}
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}