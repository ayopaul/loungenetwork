// app/admin/blog/page.tsx
import BlogManager from "@/components/admin/BlogManager";

export default function BlogPage() {
  return (
    <BlogManager station={{ id: "lounge877", name: "Lounge 87.7 FM" }} />
  );
}
