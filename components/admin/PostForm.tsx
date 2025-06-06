// components/admin/PostForm.tsx
// Fixed the category field population and form data handling for PostgreSQL

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
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import YouTube from "@/components/blog/YouTube";
import MarkdownEditor from "./MarkdownEditor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStations } from "@/hooks/useStations";
import { toast } from "sonner";

function PostForm() {
  const { selected, setSelected } = useStationStore();
  const { isEditMode, selectedPost, closeDialog } = useBlogStore();
  const { stations } = useStations();

  const [categories, setCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [categoryManuallyChanged, setCategoryManuallyChanged] = useState(false);

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

 // 1. Update the categories and posts fetching useEffect:
useEffect(() => {
  if (selected?.id) {
    Promise.all([
      fetch(`/api/categories/get?stationId=${selected.id}`).then((res) => res.json()),
      fetch(`/api/blog?stationId=${selected.id}`).then((res) => res.json())
    ]).then(([catRes, postRes]) => {
      const all = (catRes.categories || []);
      // Updated to handle new response structure
      const posts = postRes.posts || [];
      const used = [...new Set(posts.map((p: any) => p.category?.name).filter(Boolean))];
      const combined = [...new Set([...all.map((c: { name: string }) => c.name), ...used])].sort();
      setCategories(combined);
    });
  }
}, [selected?.id]);

useEffect(() => {
  if (isEditMode && selectedPost) {
    console.log("🔍 DEBUG - Selected post for editing:", selectedPost);
     // Fix: Ensure the station is set from the post
  if (selectedPost.stationId && (!selected || selected.id !== selectedPost.stationId)) {
    const match = stations.find((s) => s.id === selectedPost.stationId);
    if (match) setSelected(match);
  }
    // Handle category extraction - now much simpler!
    let categoryValue = "";
    
    if (selectedPost.category && selectedPost.category.name) {
      // If category relation is included in the fetch (this is now the standard)
      categoryValue = selectedPost.category.name;
      console.log("🔍 DEBUG - Using category relation name:", categoryValue);
    }
    
    console.log("🔍 DEBUG - Final category value:", categoryValue);
    
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
    
    // Reset the manual change flag when loading a new post
    setCategoryManuallyChanged(false);
    
  } else {
    console.log("🔍 DEBUG - Creating new post");
    setCategoryManuallyChanged(false);
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

  // Use useCallback to prevent unnecessary re-renders
  const handleChange = useCallback((field: string, value: string | boolean) => {
    console.log(`🔍 DEBUG - Changing ${field} to:`, value);
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Separate handler for category selection to prevent station reset
  const handleCategorySelect = useCallback((categoryValue: string) => {
    console.log(`🔍 DEBUG - Category selected:`, categoryValue);
    setForm((prev) => ({ ...prev, category: categoryValue }));
    setCategoryManuallyChanged(true); // Mark category as manually changed
    setOpen(false);
    setSearchTerm("");
  }, []);

  const insertAtCursor = (before: string, after: string = '') => {
    const textarea = document.querySelector("textarea#markdown-content") as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const newText = text.slice(0, start) + before + text.slice(start, end) + after + text.slice(end);
    handleChange("content", newText);
  };

  const handleSave = async () => {
    if (!selected) return toast.error("Select a station");
    if (!form.category?.trim()) return toast.error("Please select or enter a category.");

    console.log("🔍 DEBUG - Saving post with data:", form);
    console.log("🔍 DEBUG - Category being saved:", form.category);

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

      toast.success("Post saved successfully", {
        action: {
          label: "Reload Page",
          onClick: () => location.reload(),
        },
      });
      closeDialog();
    } else {
      const errorData = await res.json().catch(() => ({}));
      console.error("Save error:", errorData);
      toast.error("Something went wrong while saving your blog post.");
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    const res = await fetch(`/api/blog/delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stationId: selected.id, slug: form.slug }),
    });

    if (res.ok) {
      toast("Post deleted", {
        action: {
          label: "Reload Page",
          onClick: () => location.reload(),
        },
      });
      closeDialog();
    } else {
      toast.error("Failed to delete post.");
    }
  };

  return (
    <div className="space-y-4 bg-background text-foreground p-1">
      {/* DEBUG: Show current form state */}
      <div className="bg-yellow-100 dark:bg-yellow-900 p-2 rounded text-xs">
        <strong>DEBUG INFO:</strong><br/>
        Is Edit Mode: {isEditMode ? "Yes" : "No"}<br/>
        Current Category: "{form.category}"<br/>
        Available Categories: {categories.join(", ")}<br/>
        Selected Station: {selected?.name || "None"}<br/>
        Selected Post ID: {selectedPost?.id || "None"}<br/>
        Original Post Category Relation: {selectedPost?.category?.name || "None"}<br/>
        Original Post CategoryId: {selectedPost?.categoryId || "None"}
      </div>

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
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Title</Label>
          <Input value={form.title} onChange={(e) => handleChange("title", e.target.value)} />
        </div>
        <div> 
          <Label>Slug</Label>
          <Input value={form.slug} onChange={(e) => handleChange("slug", e.target.value)} />
        </div>
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
        <div>
          <Label>Cover Image</Label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onloadend = () => {
                if (typeof reader.result === "string") {
                  handleChange("coverImage", reader.result);
                }
              };
              reader.readAsDataURL(file);
            }}
          />
        </div>
        {form.coverImage && (
          <div className="col-span-2">
            <Label className="block mb-1">Cover Preview</Label>
            <img src={form.coverImage} className="w-32 h-32 rounded border object-cover" />
          </div>
        )}
      </div>

      <div>
        <Label>Excerpt</Label>
        <Textarea
          value={form.excerpt}
          onChange={(e) => handleChange("excerpt", e.target.value)}
        />
      </div>

      <div>
        <Label>Content (Markdown)</Label>

        <div className="flex gap-2 flex-wrap text-sm mb-2">
          <Button type="button" variant="outline" size="sm" onClick={() => insertAtCursor("**bold**")}>Bold</Button>
          <Button type="button" variant="outline" size="sm" onClick={() => insertAtCursor("_italic_")}>Italic</Button>
          <Button type="button" variant="outline" size="sm" onClick={() => insertAtCursor("`code`")}>Code</Button>
          <Button type="button" variant="outline" size="sm" onClick={() => insertAtCursor("\n## ")}>Heading</Button>
          <Button type="button" variant="outline" size="sm" onClick={() => insertAtCursor("<YouTube id=\"video_id\" />")}>YouTube</Button>
        </div>

        <MarkdownEditor
          value={form.content}
          onChange={(val: string) => setForm({ ...form, content: val })}
        />

        <div className="mt-4">
          <Label>Preview</Label>
          <div className="prose dark:prose-invert bg-muted text-foreground p-4 rounded border max-w-none">
            <Markdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={
                {
                  YouTube: (props: any) => <YouTube id={props.id} />,
                } as any
              }
            >
              {form.content}
            </Markdown>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Label>Published</Label>
        <Switch checked={form.published} onCheckedChange={(val) => handleChange("published", val)} />
      </div>

      <div className="flex justify-between pt-4">
        <Button onClick={handleSave}>{isEditMode ? "Update" : "Create"} Post</Button>
        {isEditMode && (
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}

export default PostForm;