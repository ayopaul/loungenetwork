// app/api/oaps/route.ts
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const stationId = searchParams.get("stationId");   // ?stationId=…

    const filePath = path.join(process.cwd(), "data", "oaps.json");
    const raw = await fs.readFile(filePath, "utf8");
    const all = JSON.parse(raw);

    const data = stationId ? all.filter((o: any) => o.stationId === stationId) : all;
    return NextResponse.json(data);
  } catch (err) {
    console.error("Error reading oaps.json:", err);
    return new NextResponse("Failed to load OAPs", { status: 500 });
  }
}
