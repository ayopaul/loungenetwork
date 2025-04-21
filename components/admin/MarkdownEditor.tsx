"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import YouTube from "@/components/blog/YouTube";

export default function MarkdownEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [tab, setTab] = useState<"edit" | "preview">("edit");

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4 mb-2">
        <button
          className={`text-sm font-medium px-2 py-1 rounded ${tab === "edit" ? "bg-muted" : ""}`}
          onClick={() => setTab("edit")}
        >
          Edit
        </button>
        <button
          className={`text-sm font-medium px-2 py-1 rounded ${tab === "preview" ? "bg-muted" : ""}`}
          onClick={() => setTab("preview")}
        >
          Preview
        </button>
      </div>

      {tab === "edit" ? (
        <Textarea
          id="markdown-content"
          rows={10}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <div className="prose prose-neutral dark:prose-invert max-w-none border rounded p-4 bg-background text-foreground">
          <Markdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={
              {
                YouTube: (props: any) => <YouTube id={props.id} />
              } as any
            }
          >
            {value}
          </Markdown>
        </div>
      )}
    </div>
  );
}
