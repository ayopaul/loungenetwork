"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useStationStore } from "@/stores/useStationStore";
import { useBlogStore } from "../../stores/useBlogStore";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import YouTube from "@/components/blog/YouTube";
import MarkdownEditor from "./MarkdownEditor";

const categories = ["Music", "Events", "Celebrity Gist"];

function PostForm() {
  const { selected } = useStationStore();
  const { isEditMode, selectedPost, closeDialog } = useBlogStore();

  const [form, setForm] = useState({
    id: "",
    title: "",
    slug: "",
    category: "Music",
    coverImage: "",
    excerpt: "",
    content: "",
    published: false,
  });

  useEffect(() => {
    if (isEditMode && selectedPost) {
      setForm(selectedPost);
    } else {
      setForm({
        id: crypto.randomUUID(),
        title: "",
        slug: "",
        category: "Music",
        coverImage: "",
        excerpt: "",
        content: "",
        published: false,
      });
    }
  }, [isEditMode, selectedPost]);

  const handleChange = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

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
    if (!selected) return alert("Select a station");

    const res = await fetch("/api/blog/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stationId: selected.id, post: form }),
    });

    if (res.ok) {
      alert("Post saved!");
      closeDialog();
    } else {
      alert("Failed to save post.");
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
      alert("Post deleted.");
      closeDialog();
    } else {
      alert("Failed to delete post.");
    }
  };

  return (
    <div className="space-y-4 bg-background text-foreground p-1">
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
          <select
            value={form.category}
            onChange={(e) => handleChange("category", e.target.value)}
            className="w-full border rounded p-2 bg-background text-foreground"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
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
