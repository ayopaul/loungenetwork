// app/api/oaps/save/route.ts
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const { stationId, oaps } = await req.json();

    if (!stationId || !Array.isArray(oaps)) {
      return NextResponse.json({ error: "Missing stationId or invalid OAPs" }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), "data", "oaps.json");

    // Read current data
    const raw = await fs.readFile(filePath, "utf8");
    const existing = JSON.parse(raw);

    // Remove any OAPs that belong to the same station
    const preserved = existing.filter((o: any) => o.stationId !== stationId);

    // Add in the new ones
    const merged = [...preserved, ...oaps];

    // Write it back
    await fs.writeFile(filePath, JSON.stringify(merged, null, 2));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error saving OAPs:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
