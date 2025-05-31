// app/api/schedule/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let stationId = searchParams.get('stationId');

    // If no stationId provided, you can either:
    // Option A: Use a default stationId
    if (!stationId) {
      stationId = "lounge877"; // Replace with your actual default station ID
      console.log("No stationId provided, using default:", stationId);
    }

    // Option B: If you prefer to get the first available station when no stationId is provided
    // Uncomment the code below and comment out the lines above
    /*
    if (!stationId) {
      const firstStation = await prisma.station.findFirst();
      if (!firstStation) {
        return NextResponse.json([], { status: 200 }); // Return empty array if no stations exist
      }
      stationId = firstStation.id;
      console.log("No stationId provided, using first available station:", stationId);
    }
    */

    // Fetch ALL schedule slots for this station
    const scheduleSlots = await prisma.schedule.findMany({
      where: { 
        stationId: stationId 
      },
      orderBy: [
        { weekday: 'asc' },
        { startTime: 'asc' }
      ]
    });

    console.log(`Found ${scheduleSlots.length} schedule slots for station ${stationId}`);
    
    // Return the schedule slots directly as an array
    return NextResponse.json(scheduleSlots);

  } catch (error) {
    console.error("Schedule fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch schedule" }, 
      { status: 500 }
    );
  }
}