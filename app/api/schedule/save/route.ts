//app/api/schedule/save/route.ts

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
      const { showTitle, slug, startTime, endTime, description, thumbnailUrl, weekday } = entry;
    
      if (
        !showTitle || !slug || !startTime || !endTime ||
        !description || !thumbnailUrl || typeof weekday !== "number"
      ) {
        console.warn("Invalid entry skipped:", entry);
        continue;
      }
    
      await prisma.schedule.create({
        data: {
          showTitle,
          slug,
          startTime,
          endTime,
          description,
          thumbnailUrl,
          weekday,
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
