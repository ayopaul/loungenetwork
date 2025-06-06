// app/api/blog/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { searchParams } = new URL(req.url);
  const stationId = searchParams.get("stationId");
  const { slug } = await params; // Changed: await params and destructure

  if (!stationId || !slug) {
    return NextResponse.json(
      { error: "Missing stationId or slug" }, 
      { status: 400 }
    );
  }

  try {
    const post = await prisma.post.findFirst({
      where: {
        slug,
        stationId,
        published: true, // Only return published posts
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

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" }, 
        { status: 404 }
      );
    }

    return NextResponse.json({ post });
  } catch (err) {
    console.error("Blog post fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch post" }, 
      { status: 500 }
    );
  }
}