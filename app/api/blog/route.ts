//app/api/blog/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const stationId = searchParams.get("stationId");

  if (!stationId) {
    console.warn("No stationId provided — returning empty post list.");
    return NextResponse.json([]);
  }

  try {
    const posts = await prisma.post.findMany({
      where: { stationId },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(posts);
  } catch (err) {
    console.error("Blog fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}
