import { NextRequest, NextResponse } from "next/server";
import scheduleData from "@/data/schedules.json";

export async function GET(req: NextRequest) {
  const stationId = req.nextUrl.searchParams.get("stationId") || "lounge877";

  const data = scheduleData[stationId as keyof typeof scheduleData] || [];
  return NextResponse.json(data);
}
