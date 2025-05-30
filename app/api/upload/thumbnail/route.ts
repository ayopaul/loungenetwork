// app/api/upload/thumbnail/route.ts
import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic"; // required for file uploads in app router

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("thumbnail") as File;

    if (!file) {
      return NextResponse.json({ message: "No file uploaded." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename to avoid collisions
    const filename = `${randomUUID()}-${file.name}`;
    const uploadDir = path.join(process.cwd(), "public/uploads");
    const filepath = path.join(uploadDir, filename);

    // Save the file to /public/uploads
    await writeFile(filepath, buffer);

    // Return a public URL to the file
    const publicUrl = `/uploads/${filename}`;

    return NextResponse.json({ thumbnailUrl: publicUrl });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ message: "Server error during upload." }, { status: 500 });
  }
}