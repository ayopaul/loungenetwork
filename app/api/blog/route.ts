// app/api/blog/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { Post, Category } from "@/types/supabase";

type PostWithCategory = Post & {
  categories: Pick<Category, 'id' | 'name' | 'slug'> | null;
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const stationId = searchParams.get("stationId");

  if (!stationId) {
    console.warn("No stationId provided — returning empty post list.");
    return NextResponse.json({ posts: [] });
  }

  try {
    // Fetch posts with category join (exclude content for list view - it's large)
    const { data: posts, error } = await supabase
      .from("posts")
      .select(`
        id,
        title,
        slug,
        excerpt,
        cover_image,
        published,
        station_id,
        category_id,
        created_at,
        categories (
          id,
          name,
          slug
        )
      `)
      .eq("station_id", stationId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Transform snake_case to camelCase for API response
    const transformedPosts = ((posts || []) as PostWithCategory[]).map((post) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
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
    }));

    return NextResponse.json({ posts: transformedPosts });
  } catch (err) {
    console.error("Blog fetch error:", err);
    return NextResponse.json({ posts: [] }, { status: 500 });
  }
}
