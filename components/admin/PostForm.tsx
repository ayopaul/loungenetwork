// components/admin/PostForm.tsx
// Enhanced with image upload capabilities

"use client";

import { useEffect, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useStationStore } from "@/stores/useStationStore";
import { useBlogStore } from "../../stores/useBlogStore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStations } from "@/hooks/useStations";
import { toast } from "sonner";
import ImageUpload from "./ImageUpload";
import EnhancedMarkdownEditor from "./EnhancedMarkdownEditor";

function PostForm() {
  const { selected, setSelected } = useStationStore();
  const { isEditMode, selectedPost, closeDialog } = useBlogStore();
  const { stations } = useStations();

  const [categories, setCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [categoryManuallyChanged, setCategoryManuallyChanged] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const [form, setForm] = useState({
    id: "",
    title: "",
    slug: "",
    category: "",
    coverImage: "",
    excerpt: "",
    content: "",
    published: false,
  });

  // Update the categories and posts fetching useEffect:
  useEffect(() => {
    if (selected?.id) {
      Promise.all([
        fetch(`/api/categories/get?stationId=${selected.id}`).then((res) => res.json()),
        fetch(`/api/blog?stationId=${selected.id}`).then((res) => res.json())
      ]).then(([catRes, postRes]) => {
        const all = (catRes.categories || []);
        const posts = postRes.posts || [];
        const used = [...new Set(posts.map((p: any) => p.category?.name).filter(Boolean))];
        const combined = [...new Set([...all.map((c: { name: string }) => c.name), ...used])].sort();
        setCategories(combined);
      });
    }
  }, [selected?.id]);

  useEffect(() => {
    if (isEditMode && selectedPost) {
      // Fix: Ensure the station is set from the post
      if (selectedPost.stationId && (!selected || selected.id !== selectedPost.stationId)) {
        const match = stations.find((s) => s.id === selectedPost.stationId);
        if (match) setSelected(match);
      }
      
      // Handle category extraction
      let categoryValue = "";
      if (selectedPost.category && selectedPost.category.name) {
        categoryValue = selectedPost.category.name;
      }
      
      // Populate form with all available fields from selectedPost
      setForm({
        id: selectedPost.id || crypto.randomUUID(),
        title: selectedPost.title || "",
        slug: selectedPost.slug || "",
        category: categoryValue,
        coverImage: selectedPost.coverImage || selectedPost.cover_image || "",
        excerpt: selectedPost.excerpt || "",
        content: selectedPost.content || "",
        published: selectedPost.published || false,
      });
      
      // Reset the manual change flags when loading a new post
      setCategoryManuallyChanged(false);
      setSlugManuallyEdited(true); // Slug exists, mark as edited

    } else {
      setCategoryManuallyChanged(false);
      setSlugManuallyEdited(false); // New post, allow auto-generation
      setForm({
        id: crypto.randomUUID(),
        title: "",
        slug: "",
        category: "",
        coverImage: "",
        excerpt: "",
        content: "",
        published: false,
      });
    }
  }, [isEditMode, selectedPost?.id]);

  // Helper to generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-'); // Remove consecutive hyphens
  };

  // Use useCallback to prevent unnecessary re-renders
  const handleChange = useCallback((field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Special handler for title that auto-generates slug
  const handleTitleChange = useCallback((title: string) => {
    setForm((prev) => {
      const updates: Partial<typeof prev> = { title };
      // Auto-generate slug only if it hasn't been manually edited
      if (!slugManuallyEdited) {
        updates.slug = generateSlug(title);
      }
      return { ...prev, ...updates };
    });
  }, [slugManuallyEdited]);

  // Handler for slug that marks it as manually edited
  const handleSlugChange = useCallback((slug: string) => {
    setSlugManuallyEdited(true);
    setForm((prev) => ({ ...prev, slug }));
  }, []);

  // Separate handler for category selection to prevent station reset
  const handleCategorySelect = useCallback((categoryValue: string) => {
    setForm((prev) => ({ ...prev, category: categoryValue }));
    setCategoryManuallyChanged(true);
    setOpen(false);
    setSearchTerm("");
  }, []);

  const handleSave = async () => {
    if (!selected) {
      toast.error("Select a station");
      return;
    }
    if (!form.slug?.trim()) {
      toast.error("Please enter a slug for the post URL.");
      return;
    }
    if (!form.category?.trim()) {
      toast.error("Please select or enter a category.");
      return;
    }

    try {
      const res = await fetch("/api/blog/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stationId: selected.id, post: form }),
      });

      if (res.ok) {
        // Save category if it's new
        if (!categories.includes(form.category)) {
          await fetch("/api/categories/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              stationId: selected.id,
              category: {
                name: form.category,
                slug: form.category.toLowerCase().replace(/\s+/g, "-"),
                visible: false
              }
            })
          });
        }

        toast.success("Post saved successfully");
        closeDialog();
        window.dispatchEvent(new Event("blog-post-saved"));
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error("Save error:", errorData);
        toast.error(errorData.error || "Something went wrong while saving your blog post.");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Network error while saving post");
    }
  };

  const handleDelete = async () => {
    if (!selected) {
      toast.error("No station selected");
      return;
    }

    if (!form.slug) {
      toast.error("Cannot delete: post has no slug");
      return;
    }

    // Confirm before deleting
    if (!confirm("Are you sure you want to delete this post? This cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`/api/blog/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stationId: selected.id, slug: form.slug }),
      });

      if (res.ok) {
        toast.success("Post deleted successfully");
        closeDialog();
        window.dispatchEvent(new Event("blog-post-saved"));
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error("Delete error:", errorData);
        toast.error(errorData.error || "Failed to delete post");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Network error while deleting post");
    }
  };

  return (
    <div className="space-y-6 bg-background text-foreground p-4 max-w-4xl mx-auto">
      {/* Station Selection */}
      <div>
        <Label>Station</Label>
        <Select
          value={selected?.id || ""}
          onValueChange={(val) => {
            const match = stations.find((s) => s.id === val);
            if (match) setSelected(match);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select station" />
          </SelectTrigger>
          <SelectContent>
            {stations.map((station) => (
              <SelectItem key={station.id} value={station.id}>
                {station.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Title and Slug */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Title</Label>
          <Input
            value={form.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Enter post title"
          />
        </div>
        <div>
          <Label>Slug</Label>
          <Input
            value={form.slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            placeholder="post-url-slug"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Auto-generated from title. Edit to customize.
          </p>
        </div>
      </div>

      {/* Category and Cover Image */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Category</Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                {form.category || "Select category"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput
                  placeholder="Search or create category..."
                  value={searchTerm}
                  onValueChange={setSearchTerm}
                />
                <CommandEmpty>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left"
                    onClick={() => handleCategorySelect(searchTerm)}
                  >
                    Create category "{searchTerm}"
                  </Button>
                </CommandEmpty>
                <CommandGroup>
                  {categories.map((cat) => (
                    <CommandItem
                      key={cat}
                      value={cat}
                      onSelect={handleCategorySelect}
                    >
                      {cat}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          <p className="text-sm text-muted-foreground mt-1">
            Type to select a category. If you enter a new one, it will be created automatically.
          </p>
        </div>

        {/* Cover Image Upload */}
        <div>
          <ImageUpload
            stationId={selected?.id || ""}
            postId={form.id}
            type="cover"
            currentCoverImage={form.coverImage}
            onCoverImageSet={(url) => handleChange("coverImage", url)}
          />
        </div>
      </div>

      {/* Excerpt */}
      <div>
        <Label>Excerpt</Label>
        <Textarea
          value={form.excerpt}
          onChange={(e) => handleChange("excerpt", e.target.value)}
          placeholder="Brief description of your post..."
          rows={3}
        />
      </div>

      {/* Enhanced Markdown Editor */}
      <div>
        <Label className="text-lg font-semibold">Content</Label>
        <EnhancedMarkdownEditor
          value={form.content}
          onChange={(val) => handleChange("content", val)}
          stationId={selected?.id || ""}
          postId={form.id}
        />
      </div>

      {/* Published Switch */}
      <div className="flex items-center gap-2">
        <Switch 
          checked={form.published} 
          onCheckedChange={(val) => handleChange("published", val)} 
        />
        <Label>Published</Label>
        <span className="text-sm text-muted-foreground">
          {form.published ? "Post is live" : "Post is draft"}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-6 border-t">
        <div className="flex gap-2">
          <Button type="button" onClick={handleSave} size="lg">
            {isEditMode ? "Update" : "Create"} Post
          </Button>
          <Button type="button" variant="outline" onClick={closeDialog}>
            Cancel
          </Button>
        </div>

        {isEditMode && (
          <Button type="button" variant="destructive" onClick={handleDelete}>
            Delete Post
          </Button>
        )}
      </div>
    </div>
  );
}

export default PostForm;