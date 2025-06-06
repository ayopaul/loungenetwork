// app/api/blog/save/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  let stationId: string;
  let post: any;

  try {
    ({ stationId, post } = await req.json());
    post.id = post.id || `${post.slug}-${Date.now()}`;

    if (!stationId || !post?.slug) {
      return NextResponse.json({ error: "Missing stationId or slug" }, { status: 400 });
    }

    console.log("🔍 DEBUG - Saving post with category:", post.category);

    // --- 🔍 Ensure categoryId is always set ---
    let categoryId: string;

    if (post.category && post.category.trim()) {
      // Create slug from category name
      const slug = post.category.toLowerCase().replace(/\s+/g, "-");
      
      console.log("🔍 DEBUG - Looking for category with slug:", slug, "and stationId:", stationId);
      
      // Try to find existing category by name and stationId
      const existingCategory = await prisma.category.findFirst({
        where: { 
          name: post.category,
          stationId 
        },
      });

      if (existingCategory) {
        categoryId = existingCategory.id;
        console.log("🔍 DEBUG - Found existing category:", existingCategory.id, existingCategory.name);
      } else {
        // Create new category with unique ID
        const newCategoryId = `${slug}-${Date.now()}`;
        const created = await prisma.category.create({
          data: {
            id: newCategoryId,
            name: post.category,
            slug,
            visible: true,
            stationId,
          },
        });
        categoryId = created.id;
        console.log("🔍 DEBUG - Created new category:", created.id, created.name);
      }
    } else {
      // 🔁 Fallback to "Uncategorized"
      const fallbackSlug = "uncategorized";
      const fallbackCategory = await prisma.category.upsert({
        where: {
          slug_stationId: {
            slug: fallbackSlug,
            stationId,
          },
        },
        update: {},
        create: {
          id: `${fallbackSlug}-${Date.now()}`,
          name: "Uncategorized",
          slug: fallbackSlug,
          visible: false,
          stationId,
        },
      });
      categoryId = fallbackCategory.id;
      console.log("🔍 DEBUG - Using fallback category:", fallbackCategory.id);
    }

    console.log("🔍 DEBUG - Final categoryId for post:", categoryId);

    // --- ✅ Save post via upsert ---
    const updateData = {
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || "",
      content: post.content || "",
      coverImage: post.coverImage || "",
      published: post.published || false,
      stationId,
      categoryId,
    };

    const createData = {
      id: post.id,
      ...updateData,
    };

    const savedPost = await prisma.post.upsert({
      where: { id: post.id },
      update: updateData,
      create: createData,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    console.log("🔍 DEBUG - Saved post with category relation:", savedPost.category);

    // --- 📦 Fetch categories after save ---
    const categories = await prisma.category.findMany({
      where: { stationId },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ 
      success: true, 
      categories,
      post: savedPost 
    });
  } catch (err) {
    console.error("🔥 Blog save error:", err);
    return NextResponse.json({ error: "Failed to save post" }, { status: 500 });
  }
}