// app/api/stations/save/route.ts
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

const filePath = path.join(process.cwd(), "data", "stations.json");

export async function POST(req: NextRequest) {
  try {
    const newStation = await req.json();

    if (!newStation?.id || !newStation?.name || !newStation?.streamUrl) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const raw = await fs.readFile(filePath, "utf-8");
    const stations = JSON.parse(raw);

    const index = stations.findIndex((s: any) => s.id === newStation.id);
    if (index >= 0) {
      stations[index] = newStation; // update
    } else {
      stations.push(newStation); // create
    }

    await fs.writeFile(filePath, JSON.stringify(stations, null, 2), "utf-8");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error saving station:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
