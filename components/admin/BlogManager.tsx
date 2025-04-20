"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useStationStore } from "@/stores/useStationStore";

type Post = {
  id: string;
  title: string;
  slug: string;
  category: string;
  coverImage: string;
  excerpt: string;
  content: string;
  published: boolean;
};

export default function BlogManager() {
  const { selected } = useStationStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const [newPost, setNewPost] = useState<Post>({
    id: crypto.randomUUID(),
    title: "",
    slug: "",
    category: "",
    coverImage: "",
    excerpt: "",
    content: "",
    published: false
  });

  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    fetch(`/api/blog?stationId=${selected.id}`)
      .then(res => res.json())
      .then(data => {
        setPosts(data);
        setLoading(false);
      });
  }, [selected]);

  const savePost = async () => {
    if (!selected) return;

    const updated = [...posts, newPost];
    const res = await fetch("/api/blog/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stationId: selected.id, posts: updated }),
    });

    if (res.ok) {
      setPosts(updated);
      setNewPost({
        id: crypto.randomUUID(),
        title: "",
        slug: "",
        category: "",
        coverImage: "",
        excerpt: "",
        content: "",
        published: false
      });
    }
  };

  const deletePost = (id: string) => {
    const updated = posts.filter(p => p.id !== id);
    setPosts(updated);
  };

  if (!selected) return <p className="text-muted-foreground">No station selected.</p>;

  return (
    <div className="space-y-10">
      {/* Create Post */}
      <div>
        <h2 className="text-xl font-semibold mb-2">New Blog Post</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Title</Label>
            <Input value={newPost.title} onChange={e => setNewPost({ ...newPost, title: e.target.value })} />
          </div>
          <div>
            <Label>Slug</Label>
            <Input value={newPost.slug} onChange={e => setNewPost({ ...newPost, slug: e.target.value })} />
          </div>
          <div>
            <Label>Category</Label>
            <Input value={newPost.category} onChange={e => setNewPost({ ...newPost, category: e.target.value })} />
          </div>
          <div>
            <Label>Cover Image URL</Label>
            <Input value={newPost.coverImage} onChange={e => setNewPost({ ...newPost, coverImage: e.target.value })} />
          </div>
          <div className="col-span-2">
            <Label>Excerpt</Label>
            <Textarea value={newPost.excerpt} onChange={e => setNewPost({ ...newPost, excerpt: e.target.value })} />
          </div>
          <div className="col-span-2">
            <Label>Content (Markdown)</Label>
            <Textarea rows={6} value={newPost.content} onChange={e => setNewPost({ ...newPost, content: e.target.value })} />
          </div>
          <div className="flex items-center gap-2">
            <Label>Published</Label>
            <Switch checked={newPost.published} onCheckedChange={(val) => setNewPost({ ...newPost, published: val })} />
          </div>
        </div>
        <Button onClick={savePost} className="mt-4">
          Save Post
        </Button>
      </div>

      {/* Post List */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Posts for {selected.name}</h2>

        {loading && <p className="text-sm text-muted-foreground">Loading posts...</p>}

        {!loading && posts.length === 0 && (
          <p className="text-sm text-muted-foreground">No posts found for this station.</p>
        )}

        {!loading && posts.length > 0 && (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="p-4 border rounded-lg flex gap-4">
                {post.coverImage && (
                  <img src={post.coverImage} alt={post.title} className="w-16 h-16 rounded object-cover" />
                )}
                <div className="flex-1">
                  <p className="font-medium">{post.title}</p>
                  <p className="text-xs text-muted-foreground">{post.slug}</p>
                  <p className="text-sm mt-1 line-clamp-2">{post.excerpt}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => deletePost(post.id)}>
                  Delete
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
