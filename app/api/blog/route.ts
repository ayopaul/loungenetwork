import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

const filePath = path.join(process.cwd(), "data", "posts.json");

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const stationId = searchParams.get("stationId");

    if (!stationId) {
      return NextResponse.json({ error: "Missing stationId" }, { status: 400 });
    }

    const raw = await fs.readFile(filePath, "utf-8");
    const posts = JSON.parse(raw);

    return NextResponse.json(posts[stationId] || []);
  } catch (err) {
    console.error("Failed to load posts:", err);
    return NextResponse.json({ error: "Failed to load posts" }, { status: 500 });
  }
}
