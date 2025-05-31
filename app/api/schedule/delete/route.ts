// app/api/schedule/delete/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(req: NextRequest) {
  try {
    const { stationId, scheduleSlotId } = await req.json();

    if (!stationId || !scheduleSlotId) {
      return NextResponse.json({ 
        error: "Missing stationId or scheduleSlotId" 
      }, { status: 400 });
    }

    // Verify the schedule slot belongs to the station before deleting
    const scheduleSlot = await prisma.schedule.findFirst({
      where: {
        id: scheduleSlotId,
        stationId: stationId
      }
    });

    if (!scheduleSlot) {
      return NextResponse.json({ 
        error: "Schedule slot not found or doesn't belong to this station" 
      }, { status: 404 });
    }

    // Delete the schedule slot
    await prisma.schedule.delete({
      where: {
        id: scheduleSlotId
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Schedule slot deleted successfully" 
    });

  } catch (error) {
    console.error("Schedule delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete schedule slot" }, 
      { status: 500 }
    );
  }
}