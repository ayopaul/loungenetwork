//app/api/categories/get/route.ts

import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

const filePath = path.join(process.cwd(), "data", "categories.json");

export async function GET(req: NextRequest) {
  const stationId = req.nextUrl.searchParams.get("stationId");

  if (!stationId) {
    return NextResponse.json({ categories: [] });
  }

  const raw = await fs.readFile(filePath, "utf-8");
  const allCategories = JSON.parse(raw);
  const categories = allCategories[stationId] || [];

  return NextResponse.json({ categories });
}
