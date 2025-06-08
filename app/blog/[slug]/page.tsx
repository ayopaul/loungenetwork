import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import ShareButtons from "@/components/blog/ShareButtons";
import YouTube from "@/components/blog/YouTube";
import React from "react";
import { Metadata } from "next";
import prisma from "@/lib/prisma";

// --- Types ---
type Category = {
  id: string;
  name: string;
  slug: string;
};

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  coverImage: string | null;
  published: boolean;
  stationId: string;
  categoryId: string | null; // Updated to allow null
  category: Category | null; // Updated to allow null
  createdAt: Date;
};

// --- SEO with async props ---
export async function generateMetadata(
  props: {
    params?: Promise<{ slug: string }>;
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
  }
): Promise<Metadata> {
  const params = await props.params;
  if (!params) {
    return { title: "Post Not Found" };
  }
  const post = await getPostBySlug(params.slug);
  if (!post) {
    return { title: "Post Not Found" };
  }
  return {
    title: post.title,
    description: post.excerpt,
  };
}

// --- Data Fetch from Database ---
async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    // Since we don't have stationId in the URL, we'll find the first published post with this slug
    // You might want to add stationId to your URL structure if you have multiple stations
    const post = await prisma.post.findFirst({
      where: {
        slug,
        published: true,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return post;
  } catch (error) {
    console.error("Error fetching post:", error);
    return null;
  }
}

// --- Content Parser ---
function renderContentWithYouTubeEmbeds(content: string): React.ReactNode {
  return content.split(/(<YouTube id="[^"]+" \/>)/g).map((part, idx) => {
    const match = part.match(/<YouTube id="([^"]+)" \/>/);
    if (match) {
      return <YouTube key={idx} id={match[1]} />;
    }
    return (
      <Markdown key={idx} remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
        {part}
      </Markdown>
    );
  });
}

// --- Page Component with async props ---
export default async function BlogPostPage(
  {
    params,
    searchParams,
  }: {
    params?: Promise<{ slug: string }>;
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
  }
) {
  // Await optional Promises to match generated PageProps
  const p = await params;
  await searchParams; // if you need searchParams, await and use it

  if (!p) {
    return notFound();
  }

  const post = await getPostBySlug(p.slug);
  if (!post || !post.published) {
    return notFound();
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-foreground px-4 pt-6 pb-20">
        <article className="max-w-3xl mx-auto">
          <div className="text-sm text-muted-foreground uppercase mb-2">
            {post.category?.name || 'Uncategorized'}
          </div>
          <h1 className="text-4xl font-bold mb-3">{post.title}</h1>

          {post.coverImage && (
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full rounded-xl mb-6 object-cover max-h-[400px]"
            />
          )}

          <div className="prose prose-neutral dark:prose-invert max-w-none">
            {post.content ? renderContentWithYouTubeEmbeds(post.content) : (
              <p className="text-muted-foreground">No content available.</p>
            )}
          </div>

          <hr className="my-10 border-border" />
          <ShareButtons slug={post.slug} title={post.title} />
        </article>
      </main>
    </>
  );
}