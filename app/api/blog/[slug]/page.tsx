// app/blog/[slug]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useStationStore } from '@/stores/useStationStore';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Post = {
  id: string;
  title: string;
  slug: string;
  category: Category;
  excerpt: string;
  content: string;
  coverImage: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function BlogPostPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { selected } = useStationStore();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selected?.id || !slug) return;

    setLoading(true);
    fetch(`/api/blog/${slug}?stationId=${selected.id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.post) {
          setPost(data.post);
        } else {
          setError('Post not found');
        }
      })
      .catch((err) => {
        console.error('Failed to load blog post:', err);
        setError('Failed to load blog post');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selected?.id, slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-10">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-3/4"></div>
              <div className="h-64 bg-muted rounded"></div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
                <div className="h-4 bg-muted rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
            <p className="text-muted-foreground mb-6">{error || 'The blog post you are looking for does not exist.'}</p>
            <Link href="/">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <Link href="/" className="inline-flex items-center text-primary hover:underline mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>

          <article>
            {/* Cover Image */}
            {post.coverImage && (
              <div className="mb-8">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-64 md:h-80 object-cover rounded-lg"
                />
              </div>
            )}

            {/* Post Header */}
            <header className="mb-8">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <span className="bg-primary/10 text-primary px-2 py-1 rounded-full">
                  {post.category?.name || 'Uncategorized'}
                </span>
                <span>•</span>
                <time dateTime={post.createdAt}>
                  {new Date(post.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
              
              {post.excerpt && (
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {post.excerpt}
                </p>
              )}
            </header>

            {/* Post Content */}
            <div className="prose prose-lg max-w-none dark:prose-invert">
              <div 
                dangerouslySetInnerHTML={{ __html: post.content || '' }}
                className="whitespace-pre-wrap"
              />
            </div>
          </article>

          {/* Related Posts or Back to Category */}
          <div className="mt-12 pt-8 border-t">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <Link 
                href={`/blog/category/${encodeURIComponent(post.category?.name || 'uncategorized')}`}
                className="text-primary hover:underline"
              >
                More from {post.category?.name || 'Uncategorized'}
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}