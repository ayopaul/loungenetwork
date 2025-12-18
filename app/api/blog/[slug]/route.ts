// app/api/blog/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { Post, Category } from "@/types/supabase";

type PostWithCategory = Post & {
  categories: Pick<Category, 'id' | 'name' | 'slug'> | null;
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { searchParams } = new URL(req.url);
  const stationId = searchParams.get("stationId");
  const { slug } = await params;

  if (!stationId || !slug) {
    return NextResponse.json(
      { error: "Missing stationId or slug" },
      { status: 400 }
    );
  }

  try {
    const { data, error } = await supabase
      .from("posts")
      .select(`
        *,
        categories (
          id,
          name,
          slug
        )
      `)
      .eq("slug", slug)
      .eq("station_id", stationId)
      .eq("published", true)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    const post = data as PostWithCategory;

    // Transform snake_case to camelCase for API response
    const transformedPost = {
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      coverImage: post.cover_image,
      published: post.published,
      stationId: post.station_id,
      categoryId: post.category_id,
      createdAt: post.created_at,
      category: post.categories ? {
        id: post.categories.id,
        name: post.categories.name,
        slug: post.categories.slug,
      } : null,
    };

    return NextResponse.json({ post: transformedPost });
  } catch (err) {
    console.error("Blog post fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}
