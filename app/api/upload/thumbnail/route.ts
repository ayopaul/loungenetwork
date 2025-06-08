// app/api/upload/thumbnail/route.ts
import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { mkdirSync, existsSync } from "fs";

const UPLOAD_BASE_DIR = "/var/uploads/loungenetwork";

export const dynamic = "force-dynamic";

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
    const uploadDir = path.join(UPLOAD_BASE_DIR, "general");
    const filepath = path.join(uploadDir, filename);

    console.log("🔍 Thumbnail Upload Debug Info:");
    console.log("- Upload directory:", uploadDir);
    console.log("- Filename:", filename);
    console.log("- File size:", file.size);
    console.log("- File type:", file.type);

    // Ensure directory exists
    if (!existsSync(uploadDir)) {
      console.log("📁 Creating thumbnail upload directory...");
      mkdirSync(uploadDir, { recursive: true });
    }

    // Save the file
    await writeFile(filepath, buffer);
    console.log("✅ Successfully saved thumbnail to:", filepath);

    // Return URL to be served by API route
    const publicUrl = `/api/files/general/${filename}`;

    return NextResponse.json({ thumbnailUrl: publicUrl });
  } catch (err) {
    console.error("💥 Thumbnail upload error:", err);
    return NextResponse.json({ message: "Server error during upload." }, { status: 500 });
  }
}