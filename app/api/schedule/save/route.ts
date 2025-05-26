import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { stationId, schedule } = await req.json();

    if (!stationId || !Array.isArray(schedule)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // Remove old schedules
    await prisma.schedule.deleteMany({
      where: { stationId }
    });

    // Insert new schedule
    for (const entry of schedule) {
      await prisma.schedule.create({
        data: {
          ...entry,
          stationId
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error saving schedule:", err);
    return NextResponse.json({ error: "Failed to save schedule" }, { status: 500 });
  }
}
