import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const stationId = req.nextUrl.searchParams.get("stationId");

  if (!stationId) {
    return NextResponse.json({ categories: [] });
  }

  const categories = await prisma.category.findMany({
    where: { stationId },
    orderBy: { name: "asc" }
  });

  return NextResponse.json({ categories });
}
