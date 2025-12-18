// app/api/blog/save/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAuth } from "@/lib/apiAuth";
import type { Post, Category } from "@/types/supabase";

type PostWithCategory = Post & {
  categories: Pick<Category, 'id' | 'name' | 'slug'> | null;
};

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (!auth.authorized) return auth.response;

  let stationId: string;
  let post: Record<string, unknown>;

  try {
    ({ stationId, post } = await req.json());
    post.id = post.id || `${post.slug}-${Date.now()}`;

    if (!stationId || !post?.slug) {
      return NextResponse.json({ error: "Missing stationId or slug" }, { status: 400 });
    }

    console.log("Saving post with category:", post.category);

    // --- Ensure categoryId is always set ---
    let categoryId: string;

    if (post.category && (post.category as string).trim()) {
      const categoryName = post.category as string;
      const slug = categoryName.toLowerCase().replace(/\s+/g, "-");

      console.log("Looking for category with slug:", slug, "and stationId:", stationId);

      // Try to find existing category by name and stationId
      const { data: existingCategory, error: findError } = await supabaseAdmin
        .from("categories")
        .select("*")
        .eq("name", categoryName)
        .eq("station_id", stationId)
        .single();

      if (existingCategory && !findError) {
        categoryId = (existingCategory as Category).id;
        console.log("Found existing category:", (existingCategory as Category).id, (existingCategory as Category).name);
      } else {
        // Create new category with unique ID
        const newCategoryId = `${slug}-${Date.now()}`;
        const { data: created, error: createError } = await supabaseAdmin
          .from("categories")
          .insert({
            id: newCategoryId,
            name: categoryName,
            slug,
            visible: true,
            station_id: stationId,
          })
          .select()
          .single();

        if (createError) throw createError;
        categoryId = (created as Category).id;
        console.log("Created new category:", (created as Category).id, (created as Category).name);
      }
    } else {
      // Fallback to "Uncategorized"
      const fallbackSlug = "uncategorized";

      // Try to find or create uncategorized
      const { data: fallbackCategory, error: findError } = await supabaseAdmin
        .from("categories")
        .select("*")
        .eq("slug", fallbackSlug)
        .eq("station_id", stationId)
        .single();

      if (fallbackCategory && !findError) {
        categoryId = (fallbackCategory as Category).id;
      } else {
        // Create uncategorized
        const { data: created, error: createError } = await supabaseAdmin
          .from("categories")
          .insert({
            id: `${fallbackSlug}-${Date.now()}`,
            name: "Uncategorized",
            slug: fallbackSlug,
            visible: false,
            station_id: stationId,
          })
          .select()
          .single();

        if (createError) throw createError;
        categoryId = (created as Category).id;
      }
      console.log("Using fallback category:", categoryId);
    }

    console.log("Final categoryId for post:", categoryId);

    // --- Save post via upsert ---
    const postData = {
      title: post.title as string,
      slug: post.slug as string,
      excerpt: (post.excerpt as string) || "",
      content: (post.content as string) || "",
      cover_image: (post.coverImage as string) || "",
      published: (post.published as boolean) || false,
      station_id: stationId,
      category_id: categoryId,
    };

    // Check if post exists
    const { data: existingPost } = await supabaseAdmin
      .from("posts")
      .select("id")
      .eq("id", post.id as string)
      .single();

    let savedPost: PostWithCategory;

    if (existingPost) {
      // Update existing
      const { data, error } = await supabaseAdmin
        .from("posts")
        .update(postData)
        .eq("id", post.id as string)
        .select(`
          *,
          categories (
            id,
            name,
            slug
          )
        `)
        .single();

      if (error) throw error;
      savedPost = data as PostWithCategory;
    } else {
      // Create new
      const { data, error } = await supabaseAdmin
        .from("posts")
        .insert({
          id: post.id as string,
          ...postData,
        })
        .select(`
          *,
          categories (
            id,
            name,
            slug
          )
        `)
        .single();

      if (error) throw error;
      savedPost = data as PostWithCategory;
    }

    console.log("Saved post with category relation:", savedPost.categories);

    // --- Fetch categories after save ---
    const { data: categories } = await supabaseAdmin
      .from("categories")
      .select("*")
      .eq("station_id", stationId)
      .order("name", { ascending: true });

    // Transform response to camelCase
    const transformedPost = {
      id: savedPost.id,
      title: savedPost.title,
      slug: savedPost.slug,
      excerpt: savedPost.excerpt,
      content: savedPost.content,
      coverImage: savedPost.cover_image,
      published: savedPost.published,
      stationId: savedPost.station_id,
      categoryId: savedPost.category_id,
      createdAt: savedPost.created_at,
      category: savedPost.categories ? {
        id: savedPost.categories.id,
        name: savedPost.categories.name,
        slug: savedPost.categories.slug,
      } : null,
    };

    const transformedCategories = ((categories || []) as Category[]).map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      visible: c.visible,
      stationId: c.station_id,
    }));

    return NextResponse.json({
      success: true,
      categories: transformedCategories,
      post: transformedPost
    });
  } catch (err) {
    console.error("Blog save error:", err);
    return NextResponse.json({ error: "Failed to save post" }, { status: 500 });
  }
}
