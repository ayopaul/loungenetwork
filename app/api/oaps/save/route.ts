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

    for (const oap of oaps) {
      const { id, name, bio, photoUrl, shows } = oap;
      const slug = `${slugify(name)}-${stationId.slice(0, 6)}`;

      if (!name || !photoUrl) continue;

      const data = {
        name,
        bio,
        photoUrl,
        slug,
        stationId,
        shows: Array.isArray(shows) ? shows : [],
      };

      if (id && id.startsWith("new-")) {
        // New OAP
        const created = await prisma.oAP.create({ data });
        savedOAPs.push(created);
      } else {
        // Existing OAP
        const updated = await prisma.oAP.update({
          where: { id },
          data,
        });
        savedOAPs.push(updated);
      }
    }

    return NextResponse.json({ oaps: savedOAPs });
  } catch (err) {
    console.error("Save OAPs error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}