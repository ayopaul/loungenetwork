"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useStationStore } from "@/stores/useStationStore";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";
import Markdown from "react-markdown";

export default function EditPostPage() {
  const { selected } = useStationStore();
  const { slug } = useParams() as { slug: string };
  const router = useRouter();

  const [post, setPost] = useState({
    id: "",
    title: "",
    slug: "",
    category: "",
    coverImage: "",
    excerpt: "",
    content: "",
    published: false,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selected || !slug) return;

    fetch(`/api/blog?stationId=${selected.id}`)
      .then((res) => res.json())
      .then((data) => {
        const match = data.find((p: any) => p.slug === slug);
        if (match) {
          setPost(match);
        } else {
          alert("Post not found.");
          router.push("/admin");
        }
        setLoading(false);
      });
  }, [selected, slug]);

  const handleChange = (field: string, value: string | boolean) => {
    setPost((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!selected) {
      alert("No station selected.");
      return;
    }

    const res = await fetch("/api/blog/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stationId: selected.id, post }),
    });

    if (res.ok) {
      alert("Post updated!");
    } else {
      alert("Error updating post.");
    }
  };

  if (loading) {
    return <p className="text-muted-foreground p-6">Loading post...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 bg-background text-foreground rounded-lg shadow">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Editing: {slug}</h2>
        <Link href="/admin">
          <Button variant="outline">← Back to Admin</Button>
        </Link>
      </div>

      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={post.title}
          onChange={(e) => handleChange("title", e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          value={post.slug}
          onChange={(e) => handleChange("slug", e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="category">Category</Label>
        <Input
          id="category"
          value={post.category}
          onChange={(e) => handleChange("category", e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="coverImage">Cover Image URL</Label>
        <Input
          id="coverImage"
          value={post.coverImage}
          onChange={(e) => handleChange("coverImage", e.target.value)}
        />
        {post.coverImage && (
          <img
            src={post.coverImage}
            alt="Cover Preview"
            className="w-32 h-32 mt-2 rounded object-cover border"
          />
        )}
      </div>

      <div>
        <Label htmlFor="excerpt">Excerpt</Label>
        <Textarea
          id="excerpt"
          value={post.excerpt}
          onChange={(e) => handleChange("excerpt", e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="content">Content (Markdown)</Label>
        <Textarea
          id="content"
          rows={10}
          value={post.content}
          onChange={(e) => handleChange("content", e.target.value)}
        />
        <div className="mt-4">
          <Label className="block mb-1">Preview</Label>
          <div className="prose dark:prose-invert max-w-none bg-muted p-4 rounded border">
            <Markdown>{post.content}</Markdown>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Label htmlFor="published">Published</Label>
        <Switch
          id="published"
          checked={post.published}
          onCheckedChange={(checked) => handleChange("published", checked)}
        />
      </div>

      <Button onClick={handleSave}>Update Post</Button>
    </div>
  );
}
