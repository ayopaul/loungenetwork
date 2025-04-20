"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function PostEditor() {
  const [post, setPost] = useState({
    title: "",
    slug: "",
    category: "",
    coverImage: "",
    excerpt: "",
    content: "",
    published: false,
  });

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
      alert("Post saved!");
    } else {
      alert("Error saving post.");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow space-y-6 max-w-3xl mx-auto">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={post.title}
          onChange={(e) => handleChange("title", e.target.value)}
          placeholder="Enter post title"
        />
      </div>

      <div>
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          value={post.slug}
          onChange={(e) => handleChange("slug", e.target.value)}
          placeholder="e.g. my-first-post"
        />
      </div>

      <div>
        <Label htmlFor="category">Category</Label>
        <Input
          id="category"
          value={post.category}
          onChange={(e) => handleChange("category", e.target.value)}
          placeholder="e.g. News"
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

      <Button onClick={handleSave}>Save Post</Button>
    </div>
  );
}
