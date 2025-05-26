import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const stationId = req.nextUrl.searchParams.get("stationId") || "lounge877";

  try {
    console.log("🔎 stationId received:", stationId);
    const data = await prisma.schedule.findMany({
      where: { stationId },
    orderBy: [
      { weekday: "asc" },
      { startTime: "asc" }
    ]
    });

    console.log("📅 Fetched schedules:", data.length);
    return NextResponse.json(data);
  } catch (err) {
    console.error("❌ Failed to fetch schedules:", err instanceof Error ? err.message : err);
    console.error("🔍 Stack:", err instanceof Error ? err.stack : "No stack available");
    return NextResponse.json([], { status: 500 });
  }
}