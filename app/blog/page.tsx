// app/blog/page.tsx
import fs from "fs/promises"
import path from "path"
import Navbar from "@/components/layout/Navbar"
import BlogPageClient from "./BlogPageClient"

type Post = {
  id: string
  title: string
  slug: string
  coverImage: string
  excerpt: string
  category: string
  published: boolean
}

export default async function BlogIndexPage() {
  const filePath = path.join(process.cwd(), "data", "posts.json")
  const raw = await fs.readFile(filePath, "utf-8")
  const all = JSON.parse(raw)

  const allPosts = Object.values(all)
    .flatMap((stationPosts: any) => Object.values(stationPosts)) as Post[]

  const publishedPosts = allPosts.filter((post) => post.published)
  const categories = Array.from(new Set(publishedPosts.map(post => post.category))).sort()

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-foreground px-4 pt-10 pb-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">All Blog Posts</h1>
          <BlogPageClient posts={publishedPosts} categories={categories} />
        </div>
      </main>
    </>
  )
}
