//app/blog/BlogPageClients.tsx

'use client'
import dynamic from 'next/dynamic'

// Dynamically import BlogListWithFilter with SSR disabled
const BlogListWithFilter = dynamic(() => import('@/components/blog/BlogListWithFilter'), {
  ssr: false,
})

// Define the Post type inline
type Post = {
  id: string
  title: string
  slug: string
  coverImage: string
  excerpt: string
  category: string
  content?: string
  published: boolean
  createdAt?: string
}

type BlogPageClientProps = {
  posts: Post[]
  categories: string[]
}

export default function BlogPageClient({ posts, categories }: BlogPageClientProps) {
  return <BlogListWithFilter posts={posts} categories={categories} />
}
