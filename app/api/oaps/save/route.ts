// app/api/oaps/save/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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
        photoUrl: photoUrl?.trim() || "",
        slug,
        stationId,
        shows: Array.isArray(shows) ? shows : [],
      };

      try {
        if (id && id.startsWith("new-")) {
          // New OAP - create
          const created = await prisma.oAP.create({ data });
          savedOAPs.push(created);
        } else if (id) {
          // Existing OAP - update
          const updated = await prisma.oAP.update({
            where: { id },
            data,
          });
          savedOAPs.push(updated);
        } else {
          skippedOAPs.push({ id, reason: "No valid ID" });
        }
      } catch (dbError) {
        console.error(`Database error for OAP ${id}:`, dbError);
        skippedOAPs.push({ id, reason: "Database error", error: dbError });
      }
    }

    const response: any = { 
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