// app/api/categories/get/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { Category } from "@/types/supabase";

export async function GET(req: NextRequest) {
  const stationId = req.nextUrl.searchParams.get("stationId");

  if (!stationId) {
    return NextResponse.json({ categories: [] });
  }

  try {
    const { data: categories, error } = await supabase
      .from("categories")
      .select("*")
      .eq("station_id", stationId)
      .order("name", { ascending: true });

    if (error) throw error;

    // Transform snake_case to camelCase for API response
    const transformedCategories = ((categories || []) as Category[]).map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      visible: c.visible,
      stationId: c.station_id,
    }));

    return NextResponse.json({ categories: transformedCategories });
  } catch (err) {
    console.error("Categories fetch error:", err);
    return NextResponse.json({ categories: [] });
  }
}
