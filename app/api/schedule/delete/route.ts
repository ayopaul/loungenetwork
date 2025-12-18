// app/api/schedule/delete/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAuth } from "@/lib/apiAuth";

export async function DELETE(req: NextRequest) {
  const auth = await requireAuth();
  if (!auth.authorized) return auth.response;

  try {
    const { stationId, scheduleSlotId } = await req.json();

    if (!stationId || !scheduleSlotId) {
      return NextResponse.json({
        error: "Missing stationId or scheduleSlotId"
      }, { status: 400 });
    }

    // Verify the schedule slot belongs to the station before deleting
    const { data: scheduleSlot, error: fetchError } = await supabaseAdmin
      .from("schedules")
      .select("*")
      .eq("id", scheduleSlotId)
      .eq("station_id", stationId)
      .single();

    if (fetchError || !scheduleSlot) {
      return NextResponse.json({
        error: "Schedule slot not found or doesn't belong to this station"
      }, { status: 404 });
    }

    // Delete the schedule slot
    const { error: deleteError } = await supabaseAdmin
      .from("schedules")
      .delete()
      .eq("id", scheduleSlotId);

    if (deleteError) throw deleteError;

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
