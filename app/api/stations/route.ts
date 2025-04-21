// app/api/stations/route.ts
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

const filePath = path.join(process.cwd(), "data", "stations.json");

export async function GET() {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const stations = JSON.parse(raw);
    return NextResponse.json(stations);
  } catch (err) {
    console.error("Error reading stations:", err);
    return NextResponse.json([], { status: 200 });
  }
}
