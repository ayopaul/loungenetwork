import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

const filePath = path.join(process.cwd(), "data", "posts.json");

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const stationId = searchParams.get("stationId");

  if (!stationId) {
    return NextResponse.json({ error: "Missing stationId" }, { status: 400 });
  }

  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const allPosts = JSON.parse(raw);
    const stationPosts = allPosts[stationId] || [];
    return NextResponse.json(stationPosts); // ✅ return array
  } catch (err) {
    console.error("Blog fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}
