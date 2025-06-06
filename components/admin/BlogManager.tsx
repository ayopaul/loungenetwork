//components/admin/BlogManager.tsx
// this is used to control the listing of blog posts on the admin page 

"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useBlogStore } from "@/stores/useBlogStore";
import PostDialog from "./PostDialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// Updated BlogPost type to match the new category structure
type BlogPost = {
  id: string;
  title: string;
  slug: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  categoryId?: string; // Keep for backward compatibility
  excerpt: string;
  coverImage?: string;
  published: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type Category = {
  name: string;
  slug: string;
  visible: boolean;
};

interface BlogManagerProps {
  station: { id: string; name: string };
}

export default function BlogManager({ station }: BlogManagerProps) {
  const { openDialog } = useBlogStore();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);

  // Updated fetch posts function to handle new response format
  const fetchPosts = () => {
    if (!station) return;
    setLoading(true);
    
    fetch(`/api/blog?stationId=${station.id}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("🔍 DEBUG - Blog API Response:", data);
        
        // Handle both new format { posts: [...] } and old format [...]
        let postsArray: BlogPost[] = [];
        
        if (data && typeof data === 'object') {
          if (Array.isArray(data.posts)) {
            // New format: { posts: [...] }
            postsArray = data.posts;
          } else if (Array.isArray(data)) {
            // Old format: [...]
            postsArray = data;
          }
        }
        
        console.log("🔍 DEBUG - Processed posts array:", postsArray);
        
        // Ensure we have a valid array
        if (Array.isArray(postsArray)) {
          const sorted = [...postsArray].sort((a, b) => {
            // Sort by createdAt if available, otherwise by id
            if (a.createdAt && b.createdAt) {
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
            return b.id.localeCompare(a.id);
          });
          setPosts(sorted);
        } else {
          console.warn("Posts data is not in expected format:", data);
          setPosts([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching posts:", error);
        setPosts([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPosts();
  }, [station]);

  useEffect(() => {
    window.addEventListener("blog-post-saved", fetchPosts);
    return () => window.removeEventListener("blog-post-saved", fetchPosts);
  }, []);

  useEffect(() => {
    if (station?.id) {
      fetch(`/api/categories/get?stationId=${station.id}`)
        .then((res) => res.json())
        .then((data) => setCategories(data.categories || []))
        .catch((error) => {
          console.error("Error fetching categories:", error);
          setCategories([]);
        });
    }
  }, [station?.id]);

  const toggleVisibility = async (name: string) => {
    const updated = categories.map((cat) =>
      cat.name === name ? { ...cat, visible: !cat.visible } : cat
    );
    for (const cat of updated) {
      await fetch("/api/categories/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stationId: station.id, category: cat })
      });
    }
    setCategories(updated);
  };

  // Helper function to get category name
  const getCategoryName = (post: BlogPost): string => {
    if (post.category?.name) {
      return post.category.name;
    }
    // Fallback for posts without category relation
    return 'Uncategorized';
  };

  if (!station) return <p className="text-muted-foreground">No station selected.</p>;

  return (
    <div className="space-y-6 bg-background text-foreground p-4 rounded-lg">
      <Tabs defaultValue="posts" className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Blog Posts for {station.name}</h2>
          <Button variant="outline" onClick={() => openDialog()}>+ Create Post</Button>
        </div>
        <TabsList className="w-full justify-start mb-4">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="posts">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading posts...</p>
          ) : !Array.isArray(posts) || posts.length === 0 ? (
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
                          {getCategoryName(post)} · {post.slug}
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
        </TabsContent>

        <TabsContent value="categories">
          <div>
            <h3 className="text-lg font-semibold">Manage Category Visibility</h3>
            <div className="space-y-2 mt-2">
              {categories.length === 0 ? (
                <p className="text-muted-foreground">No categories yet.</p>
              ) : (
                categories.map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between border p-2 rounded">
                    <div>
                      <div className="font-medium">{cat.name}</div>
                      <div className="text-sm text-muted-foreground">/{cat.slug}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label>Visible</Label>
                      <Switch
                        checked={cat.visible}
                        onCheckedChange={() => toggleVisibility(cat.name)}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}