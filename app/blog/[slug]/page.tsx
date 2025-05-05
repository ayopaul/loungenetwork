// app/blog/[slug]/page.tsx
import fs from "fs/promises";
import path from "path";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
// import GlobalAudioPlayer from "@/components/player/GlobalAudioProvider";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Metadata } from "next";
import ShareButtons from "@/components/blog/ShareButtons";
import rehypeRaw from "rehype-raw";
import YouTube from "@/components/blog/YouTube";



type Post = {
  id: string;
  title: string;
  slug: string;
  coverImage: string;
  excerpt: string;
  content: string;
  category: string;
  published: boolean;
};

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  if (!post) return { title: "Post Not Found" };

  return {
    title: post.title,
    description: post.excerpt,
  };
}

async function getPostBySlug(slug: string): Promise<Post | null> {
  const filePath = path.join(process.cwd(), "data", "posts.json");
  const raw = await fs.readFile(filePath, "utf-8");
  const all = JSON.parse(raw);

  for (const stationId in all) {
    const match = Object.values(all[stationId]).find((p: any) => p.slug === slug);
    if (match) return match as Post;
  }

  return null;
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);
  if (!post || !post.published) return notFound();

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-background text-foreground px-4 pt-6 pb-20">
        <article className="max-w-3xl mx-auto">
          <div className="text-sm text-muted-foreground uppercase mb-2">{post.category}</div>
          <h1 className="text-4xl font-bold mb-3">{post.title}</h1>

          {post.coverImage && (
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full rounded-xl mb-6 object-cover max-h-[400px]"
            />
          )}

          <div className="prose prose-neutral dark:prose-invert max-w-none">
          <Markdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={
                {
                YouTube: (props: any) => <YouTube id={props.id} />
                } as any
            }
            >
            {post.content}</Markdown>
          </div>

          {/* Notion-style footer CTA and share */}
          <hr className="my-10 border-border" />
            <ShareButtons slug={post.slug} title={post.title} />
        </article>
      </main>

      {/* <GlobalAudioPlayer /> */}
    </>
  );
}
