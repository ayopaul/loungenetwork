import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

const filePath = path.join(process.cwd(), "data", "schedules.json");

export async function POST(req: NextRequest) {
  try {
    const { stationId, schedule } = await req.json();

    if (!stationId || !Array.isArray(schedule)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // Read existing file
    const raw = await fs.readFile(filePath, "utf-8");
    const allSchedules = JSON.parse(raw);

    // Update schedule for given station
    allSchedules[stationId] = schedule;

    // Write updated JSON
    await fs.writeFile(filePath, JSON.stringify(allSchedules, null, 2), "utf-8");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error saving schedule:", err);
    return NextResponse.json({ error: "Failed to save schedule" }, { status: 500 });
  }
}
