// app/blog/page.tsx
import fs from "fs/promises";
import path from "path";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import dynamic from "next/dynamic";

type Post = {
  id: string;
  title: string;
  slug: string;
  coverImage: string;
  excerpt: string;
  category: string;
  published: boolean;
};

export default async function BlogIndexPage() {
  const BlogListWithFilter = dynamic(() => import('@/components/blog/BlogListWithFilter'), {
    ssr: false,
  });
  const filePath = path.join(process.cwd(), "data", "posts.json");
  const raw = await fs.readFile(filePath, "utf-8");
  const all = JSON.parse(raw);

  const allPosts = Object.values(all)
    .flatMap((stationPosts: any) => Object.values(stationPosts)) as Post[];

  const publishedPosts = allPosts.filter((post) => post.published);
  const categories = Array.from(new Set(publishedPosts.map(post => post.category))).sort();


  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-foreground px-4 pt-10 pb-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">All Blog Posts</h1>

          {/* <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {publishedPosts.map((post) => (
              <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="border rounded-lg overflow-hidden hover:bg-muted transition"
            >
              {post.coverImage && (
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-40 object-cover"
                />
              )}
              <div className="p-4">
                <Link
                  href={`/blog/category/${encodeURIComponent(post.category.toLowerCase())}`}
                  className="text-sm text-primary underline underline-offset-2 mb-1 block"
                >
                  {post.category}
                </Link>
                <h2 className="font-semibold text-lg line-clamp-1">{post.title}</h2>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {post.excerpt}
                </p>
              </div>
            </Link>            
            ))}
          </div> */}
          <BlogListWithFilter posts={publishedPosts} categories={categories} />
        </div>
      </main>
    </>
  );
}
