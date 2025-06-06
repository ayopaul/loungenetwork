// app/api/blog/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const stationId = searchParams.get("stationId");

  if (!stationId) {
    console.warn("No stationId provided — returning empty post list.");
    return NextResponse.json({ posts: [] });
  }

  try {
    const posts = await prisma.post.findMany({
      where: { stationId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ posts });
  } catch (err) {
    console.error("Blog fetch error:", err);
    // ✅ Always return an object with posts array so frontend logic doesn't crash
    return NextResponse.json({ posts: [] }, { status: 500 });
  }
}