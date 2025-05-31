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

    // --- 🔍 Ensure categoryId is always set ---
    let categoryId: string;

    if (post.category) {
      const slug = post.category.toLowerCase().replace(/\s+/g, "-");
      const existingCategory = await prisma.category.findFirst({
        where: { slug, stationId },
      });

      if (existingCategory) {
        categoryId = existingCategory.id;
      } else {
        const created = await prisma.category.create({
          data: {
            id: `${slug}-${Date.now()}`,
            name: post.category,
            slug,
            visible: true,
            stationId,
          },
        });
        categoryId = created.id;
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
    }

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

    await prisma.post.upsert({
      where: { id: post.id },
      update: updateData,
      create: createData,
    });

    // --- 📦 Fetch categories after save ---
    const categories = await prisma.category.findMany({
      where: { stationId },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, categories });
  } catch (err) {
    console.error("🔥 Blog save error:", err);
    return NextResponse.json({ error: "Failed to save post" }, { status: 500 });
  }
}