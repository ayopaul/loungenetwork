// app/api/oaps/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { OAP } from "@/types/supabase";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const stationId = searchParams.get("stationId");

    let query = supabase
      .from("oaps")
      .select("*")
      .order("name", { ascending: true });

    if (stationId) {
      query = query.eq("station_id", stationId);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Transform snake_case to camelCase for API response
    const transformedOaps = ((data || []) as OAP[]).map((oap) => ({
      id: oap.id,
      name: oap.name,
      slug: oap.slug,
      bio: oap.bio,
      photoUrl: oap.photo_url,
      shows: oap.shows,
      stationId: oap.station_id,
    }));

    return NextResponse.json(transformedOaps);
  } catch (err) {
    console.error("Error reading OAPs from database:", err);
    return new NextResponse("Failed to load OAPs", { status: 500 });
  }
}
