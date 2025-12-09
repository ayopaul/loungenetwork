// app/api/categories/save/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/apiAuth";

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (!auth.authorized) return auth.response;

  const { stationId, category } = await req.json();

  if (!stationId || !category?.name) {
    return NextResponse.json({ error: "Missing stationId or category name" }, { status: 400 });
  }

  // Check for duplicate (case-insensitive) name
  const existing = await prisma.category.findMany({
    where: {
      stationId,
      name: {
        equals: category.name,
        mode: "insensitive"
      }
    }
  });

  if (existing.length === 0) {
    await prisma.category.create({
      data: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        visible: category.visible ?? false,
        stationId
      }
    });
  }

  const categories = await prisma.category.findMany({
    where: { stationId },
    orderBy: { name: "asc" }
  });

  return NextResponse.json({ success: true, categories });
}
