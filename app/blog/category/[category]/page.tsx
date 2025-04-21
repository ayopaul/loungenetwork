// app/blog/category/[category]/page.tsx
import fs from "fs/promises";
import path from "path";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";

type Post = {
  id: string;
  title: string;
  slug: string;
  coverImage: string;
  excerpt: string;
  category: string;
  published: boolean;
};

export default async function CategoryPage({ params }: { params: { category: string } }) {
  const categoryParam = decodeURIComponent(params.category.toLowerCase());

  const filePath = path.join(process.cwd(), "data", "posts.json");
  const raw = await fs.readFile(filePath, "utf-8");
  const all = JSON.parse(raw);

  const allPosts = Object.values(all)
    .flatMap((stationPosts: any) => Object.values(stationPosts)) as Post[];

  const filteredPosts = allPosts.filter(
    (post) =>
      post.published &&
      post.category.toLowerCase() === categoryParam
  );

  if (filteredPosts.length === 0) {
    return notFound();
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-foreground px-4 pt-24 pb-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 capitalize">
            Posts in “{categoryParam}”
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
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
                  <p className="text-sm text-muted-foreground uppercase mb-1">{post.category}</p>
                  <h2 className="font-semibold text-lg line-clamp-1">{post.title}</h2>
                  <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
