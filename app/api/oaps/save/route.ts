import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate that body is an array
    if (!Array.isArray(body)) {
      return new NextResponse("Invalid data format. Expected an array.", { status: 400 });
    }

    // Path to your data/oaps.json file
    const filePath = path.join(process.cwd(), "data", "oaps.json");

    // Write updated JSON to the file
    await fs.writeFile(filePath, JSON.stringify(body, null, 2), "utf8");

    return new NextResponse("OAPs updated successfully", { status: 200 });
  } catch (error) {
    console.error("Failed to save OAPs:", error);
    return new NextResponse("Failed to save OAPs", { status: 500 });
  }
}
