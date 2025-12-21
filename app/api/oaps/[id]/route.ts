// app/api/oaps/[id]/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { unlink } from "fs/promises";
import path from "path";
import type { NextRequest } from "next/server";
import type { OAP } from "@/types/supabase";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: "Missing OAP ID" }, { status: 400 });
    }

    // Find existing OAP
    const { data: existingData, error: fetchError } = await supabaseAdmin
      .from("oaps")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existingData) {
      return NextResponse.json({ error: "OAP not found" }, { status: 404 });
    }

    const existingOAP = existingData as OAP;

    // Delete the OAP
    const { error: deleteError } = await supabaseAdmin
      .from("oaps")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    // Try to delete photo file
    if (existingOAP.photo_url) {
      try {
        const filename = existingOAP.photo_url.split("/").pop();
        if (filename) {
          const filePath = path.join(process.cwd(), "public", "oaps", filename);
          await unlink(filePath);
        }
      } catch (fileError) {
        console.warn("Could not delete photo file:", fileError);
      }
    }

    // Transform response to camelCase
    const deletedOAP = {
      id: existingOAP.id,
      name: existingOAP.name,
      slug: existingOAP.slug,
      bio: existingOAP.bio,
      photoUrl: existingOAP.photo_url,
      shows: existingOAP.shows,
      stationId: existingOAP.station_id,
    };

    return NextResponse.json({
      message: "OAP deleted successfully",
      deletedOAP,
    });
  } catch (err) {
    console.error("Delete OAP error:", err);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
