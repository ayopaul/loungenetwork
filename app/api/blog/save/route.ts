import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

const filePath = path.join(process.cwd(), "data", "posts.json");

export async function POST(req: NextRequest) {
  try {
    const { stationId, post } = await req.json();

    if (!stationId || !post?.slug) {
      return NextResponse.json({ error: "Missing stationId or slug" }, { status: 400 });
    }

    const raw = await fs.readFile(filePath, "utf-8");
    const allPosts = JSON.parse(raw);

    const stationPosts: any[] = allPosts[stationId] || [];

    // Replace post if slug exists, else add new
    const index = stationPosts.findIndex((p) => p.slug === post.slug);
    if (index !== -1) {
      stationPosts[index] = post;
    } else {
      stationPosts.push(post);
    }

    allPosts[stationId] = stationPosts;

    await fs.writeFile(filePath, JSON.stringify(allPosts, null, 2), "utf-8");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Blog save error:", err);
    return NextResponse.json({ error: "Failed to save post" }, { status: 500 });
  }
}
