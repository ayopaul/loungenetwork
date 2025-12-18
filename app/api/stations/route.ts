// app/api/stations/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { Station } from "@/types/supabase";

export async function GET() {
  try {
    const { data: stations, error } = await supabase
      .from("stations")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;

    // Transform snake_case to camelCase for API response
    const transformedStations = ((stations || []) as Station[]).map((s) => ({
      id: s.id,
      name: s.name,
      streamUrl: s.stream_url,
    }));

    return NextResponse.json(transformedStations);
  } catch (err) {
    console.error("Error reading stations:", err);
    return NextResponse.json([], { status: 200 });
  }
}
