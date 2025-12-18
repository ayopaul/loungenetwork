// app/api/blog/delete/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAuth } from "@/lib/apiAuth";

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (!auth.authorized) return auth.response;

  const { stationId, slug } = await req.json();
  if (!stationId || !slug) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  try {
    const { error } = await supabaseAdmin
      .from("posts")
      .delete()
      .eq("station_id", stationId)
      .eq("slug", slug);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Blog delete error:", err);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
