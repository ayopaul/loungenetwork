// app/api/blog/delete/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { stationId, slug } = await req.json();
  if (!stationId || !slug) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  try {
    await prisma.post.deleteMany({
      where: {
        stationId,
        slug
      }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Blog delete error:", err);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}