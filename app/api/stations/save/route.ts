// app/api/stations/save/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAuth } from "@/lib/apiAuth";

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (!auth.authorized) return auth.response;

  try {
    const newStation = await req.json();

    if (!newStation?.id || !newStation?.name || !newStation?.streamUrl) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("stations")
      .upsert({
        id: newStation.id,
        name: newStation.name,
        stream_url: newStation.streamUrl,
      }, { onConflict: "id" });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error saving station:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
