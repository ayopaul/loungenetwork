// app/api/oaps/save/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin, generateId } from "@/lib/supabase";
import { requireAuth } from "@/lib/apiAuth";
import type { OAP } from "@/types/supabase";

// Utility to generate a slug
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
}

export async function POST(req: Request) {
  const auth = await requireAuth();
  if (!auth.authorized) return auth.response;

  try {
    const { oaps, stationId } = await req.json();

    if (!Array.isArray(oaps) || !stationId) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const savedOAPs = [];
    const skippedOAPs = [];

    for (const oap of oaps) {
      const { id, name, bio, photoUrl, shows } = oap;

      // Skip OAPs that don't have at least a name
      if (!name?.trim()) {
        skippedOAPs.push({ id, reason: "Missing name" });
        continue;
      }

      const slug = `${slugify(name)}-${stationId.slice(0, 6)}`;

      const data = {
        name: name.trim(),
        bio: bio?.trim() || "",
        photo_url: photoUrl?.trim() || "",
        slug,
        station_id: stationId,
        shows: Array.isArray(shows) ? shows : [],
      };

      try {
        if (id && id.startsWith("new-")) {
          // New OAP - create
          const { data: createdData, error } = await supabaseAdmin
            .from("oaps")
            .insert({
              id: generateId(),
              ...data,
            })
            .select()
            .single();

          if (error) throw error;
          const created = createdData as OAP;

          savedOAPs.push({
            id: created.id,
            name: created.name,
            slug: created.slug,
            bio: created.bio,
            photoUrl: created.photo_url,
            shows: created.shows,
            stationId: created.station_id,
          });
        } else if (id) {
          // Existing OAP - update
          const { data: updatedData, error } = await supabaseAdmin
            .from("oaps")
            .update(data)
            .eq("id", id)
            .select()
            .single();

          if (error) throw error;
          const updated = updatedData as OAP;

          savedOAPs.push({
            id: updated.id,
            name: updated.name,
            slug: updated.slug,
            bio: updated.bio,
            photoUrl: updated.photo_url,
            shows: updated.shows,
            stationId: updated.station_id,
          });
        } else {
          skippedOAPs.push({ id, reason: "No valid ID" });
        }
      } catch (dbError) {
        console.error("Database error for OAP:", id, dbError);
        skippedOAPs.push({ id, reason: "Database error", error: dbError });
      }
    }

    const response: Record<string, unknown> = {
      oaps: savedOAPs,
      saved: savedOAPs.length
    };

    if (skippedOAPs.length > 0) {
      response.skipped = skippedOAPs;
      response.skippedCount = skippedOAPs.length;
    }

    return NextResponse.json(response);
  } catch (err) {
    console.error("Save OAPs error:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
