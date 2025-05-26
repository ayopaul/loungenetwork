//app/api/blog/save/route.ts

import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

const filePath = path.join(process.cwd(), "data", "posts.json");

export async function POST(req: NextRequest) {
  try {
    const { stationId, post } = await req.json();
    post.id = post.id || `${post.slug}-${Date.now()}`;

    if (!stationId || !post?.slug) {
      return NextResponse.json({ error: "Missing stationId or slug" }, { status: 400 });
    }

    const raw = await fs.readFile(filePath, "utf-8");
    const allPosts = JSON.parse(raw);

    const stationPosts: any[] = allPosts[stationId] || [];

    // Replace post if id or slug matches, else add new
    const updatedPosts = stationPosts.map((p) => {
      if (p.id && post.id && p.id === post.id) return post;
      if (!post.id && p.slug === post.slug) return post;
      return p;
    });

    const exists = updatedPosts.some((p) =>
      (p.id && post.id && p.id === post.id) || (!post.id && p.slug === post.slug)
    );

    if (!exists) updatedPosts.push(post);

    allPosts[stationId] = updatedPosts;

    // Ensure station category list exists
    const categoryKey = `${stationId}_categories`;
    const existingCategories: string[] = allPosts[categoryKey] || [];

    // Only add if the category is new and not already in the list
    if (post.category && !existingCategories.includes(post.category)) {
      existingCategories.push(post.category);
    }
    allPosts[categoryKey] = existingCategories;

    await fs.writeFile(filePath, JSON.stringify(allPosts, null, 2), "utf-8");

    return NextResponse.json({ success: true, categories: existingCategories });
  } catch (err) {
    console.error("Blog save error:", err);
    return NextResponse.json({ error: "Failed to save post" }, { status: 500 });
  }
}
