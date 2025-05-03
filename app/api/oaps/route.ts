// app/api/oaps/route.ts

import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "data", "oaps.json");
    const file = await fs.readFile(filePath, "utf8");
    const data = JSON.parse(file);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error reading oaps.json:", error);
    return new NextResponse("Failed to load OAPs", { status: 500 });
  }
}
