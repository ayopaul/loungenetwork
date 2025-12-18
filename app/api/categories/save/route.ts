// app/api/categories/save/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAuth } from "@/lib/apiAuth";
import type { Category } from "@/types/supabase";

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (!auth.authorized) return auth.response;

  const { stationId, category } = await req.json();

  if (!stationId || !category?.name) {
    return NextResponse.json({ error: "Missing stationId or category name" }, { status: 400 });
  }

  try {
    // Check for duplicate (case-insensitive) name
    const { data: existing } = await supabaseAdmin
      .from("categories")
      .select("*")
      .eq("station_id", stationId)
      .ilike("name", category.name);

    if (!existing || existing.length === 0) {
      const { error: insertError } = await supabaseAdmin
        .from("categories")
        .insert({
          id: category.id,
          name: category.name,
          slug: category.slug,
          visible: category.visible ?? false,
          station_id: stationId,
        });

      if (insertError) throw insertError;
    }

    // Fetch updated categories
    const { data: categories, error: fetchError } = await supabaseAdmin
      .from("categories")
      .select("*")
      .eq("station_id", stationId)
      .order("name", { ascending: true });

    if (fetchError) throw fetchError;

    // Transform snake_case to camelCase for API response
    const transformedCategories = ((categories || []) as Category[]).map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      visible: c.visible,
      stationId: c.station_id,
    }));

    return NextResponse.json({ success: true, categories: transformedCategories });
  } catch (err) {
    console.error("Category save error:", err);
    return NextResponse.json({ error: "Failed to save category" }, { status: 500 });
  }
}
