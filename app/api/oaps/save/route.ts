// app/api/oaps/save/route.ts
import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";

export async function POST(req: Request) {
  try {
    const { oaps } = await req.json();

    if (!Array.isArray(oaps)) {
      return NextResponse.json(
        { error: "Invalid data format. Expected { oaps: [...] }." },
        { status: 400 }
      );
    }

    const filePath = join(process.cwd(), "data", "oaps.json");
    await writeFile(filePath, JSON.stringify(oaps, null, 2));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error saving OAPs:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
