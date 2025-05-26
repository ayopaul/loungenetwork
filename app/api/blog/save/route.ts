//app/api/blog/save/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { stationId, post } = await req.json();
    post.id = post.id || `${post.slug}-${Date.now()}`;

    if (!stationId || !post?.slug) {
      return NextResponse.json({ error: "Missing stationId or slug" }, { status: 400 });
    }

    let categoryId: string | null = null;

    if (post.category) {
      const slug = post.category.toLowerCase().replace(/\s+/g, "-");
      const existingCategory = await prisma.category.findFirst({
        where: {
          slug,
          stationId
        }
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
            stationId
          }
        });
        categoryId = created.id;
      }
    }

    console.log("📌 Station ID:", stationId);
    console.log("🪵 Post data:", post);

    try {
      const updateData = {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt || "",
        content: post.content || "",
        coverImage: post.coverImage || "",
        published: post.published || false,
        stationId: stationId,
        ...(categoryId ? { categoryId } : {}),
      };

      const createData: any = {
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt || "",
        content: post.content || "",
        coverImage: post.coverImage || "",
        published: post.published || false,
        stationId: stationId,
      };

      if (categoryId) {
        createData.categoryId = categoryId;
      }

      await prisma.post.upsert({
        where: {
          id: post.id,
        },
        update: updateData,
        create: createData,
      });
    } catch (err) {
      console.error("🔥 Prisma post.upsert error:", err);
      throw err;
    }

    const categories = await prisma.category.findMany({
      where: { stationId },
      orderBy: { name: "asc" }
    });

    return NextResponse.json({ success: true, categories });
  } catch (err) {
    console.error("Blog save error:", err);
    return NextResponse.json({ error: "Failed to save post" }, { status: 500 });
  }
}
