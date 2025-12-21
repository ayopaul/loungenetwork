// app/api/schedule/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { Schedule } from "@/types/supabase";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let stationId = searchParams.get('stationId');

    // If no stationId provided, use default
    if (!stationId) {
      stationId = "lounge877";
    }

    const { data: scheduleSlots, error } = await supabase
      .from("schedules")
      .select("*")
      .eq("station_id", stationId)
      .order("weekday", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) throw error;

    // Transform snake_case to camelCase for API response
    const transformedSlots = ((scheduleSlots || []) as Schedule[]).map((s) => ({
      id: s.id,
      showTitle: s.show_title,
      slug: s.slug,
      startTime: s.start_time,
      endTime: s.end_time,
      description: s.description,
      thumbnailUrl: s.thumbnail_url,
      weekday: s.weekday,
      stationId: s.station_id,
    }));

    return NextResponse.json(transformedSlots);

  } catch (error) {
    console.error("Schedule fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch schedule" },
      { status: 500 }
    );
  }
}
