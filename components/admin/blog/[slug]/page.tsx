"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function EditPostPage() {
  const slug = useParams()?.slug as string;
  const [post, setPost] = useState({
    title: "",
    slug: "",
    category: "",
    coverImage: "",
    excerpt: "",
    content: "",
    published: false,
  });

  useEffect(() => {
    fetch("/data/posts.json")
      .then((res) => res.json())
      .then((data) => {
        if (slug && data[slug]) {
          setPost(data[slug]);
        }
      });
  }, [slug]);

  const handleChange = (field: string, value: string | boolean) => {
    setPost(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const res = await fetch("/api/blog/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(post),
    });

    if (res.ok) {
      alert("Post updated!");
    } else {
      alert("Error updating post.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold">Editing: {slug}</h2>

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
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          rows={10}
          value={post.content}
          onChange={(e) => handleChange("content", e.target.value)}
        />
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
