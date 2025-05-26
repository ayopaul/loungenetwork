// app/api/blog/delete/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const filePath = path.join(process.cwd(), "data", "posts.json");

export async function POST(req: NextRequest) {
  const { stationId, slug } = await req.json();
  if (!stationId || !slug) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const raw = await fs.readFile(filePath, "utf-8");
  const allPosts = JSON.parse(raw);

  if (!allPosts[stationId]) {
    return NextResponse.json({ error: "Station not found" }, { status: 404 });
  }

  allPosts[stationId] = allPosts[stationId].filter((p: any) => p.slug !== slug);

  await fs.writeFile(filePath, JSON.stringify(allPosts, null, 2), "utf-8");
  return NextResponse.json({ success: true });
}