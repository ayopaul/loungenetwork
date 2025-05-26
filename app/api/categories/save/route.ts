// app/api/categories/save/route.ts

import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

const filePath = path.join(process.cwd(), "data", "categories.json");

export async function POST(req: NextRequest) {
  const { stationId, category } = await req.json();

  if (!stationId || !category?.name) {
    return NextResponse.json({ error: "Missing stationId or category name" }, { status: 400 });
  }

  const raw = await fs.readFile(filePath, "utf-8");
  const allCategories = JSON.parse(raw);

  const stationCategories = allCategories[stationId] || [];

  // Prevent duplicate (case-insensitive) names
  const exists = stationCategories.some((c: any) => c.name.toLowerCase() === category.name.toLowerCase());
  if (!exists) {
    stationCategories.push({ ...category, visible: category.visible ?? false });
    allCategories[stationId] = stationCategories;
    await fs.writeFile(filePath, JSON.stringify(allCategories, null, 2), "utf-8");
  }

  return NextResponse.json({ success: true, categories: allCategories[stationId] });
}

