// app/api/upload/thumbnail/route.ts
import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { mkdirSync, existsSync } from "fs";
import { requireAuth, sanitizePath } from "@/lib/apiAuth";

const UPLOAD_BASE_DIR = "/var/uploads/loungenetwork";
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const auth = await requireAuth();
  if (!auth.authorized) return auth.response;

  try {
    const formData = await req.formData();
    const file = formData.get("thumbnail") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Only images are allowed." }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large. Maximum size is 5MB." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename with sanitized original name
    const safeOriginalName = sanitizePath(file.name).replace(/[^a-zA-Z0-9.-]/g, '-');
    const filename = `${randomUUID()}-${safeOriginalName}`;
    const uploadDir = path.join(UPLOAD_BASE_DIR, "general");
    const filepath = path.join(uploadDir, filename);

    // Ensure directory exists
    try {
      if (!existsSync(uploadDir)) {
        mkdirSync(uploadDir, { recursive: true });
      }
    } catch (dirError) {
      console.error("Failed to create upload directory:", uploadDir, dirError);
      return NextResponse.json({
        error: "Server configuration error: Cannot create upload directory",
        details: dirError instanceof Error ? dirError.message : String(dirError)
      }, { status: 500 });
    }

    // Save the file
    try {
      await writeFile(filepath, buffer);
    } catch (writeError) {
      console.error("Failed to write file:", filepath, writeError);
      return NextResponse.json({
        error: "Failed to save file to disk",
        details: writeError instanceof Error ? writeError.message : String(writeError)
      }, { status: 500 });
    }

    // Return URL to be served by API route
    const publicUrl = `/api/files/general/${filename}`;

    return NextResponse.json({ thumbnailUrl: publicUrl });
  } catch (err) {
    console.error("Thumbnail upload error:", err);
    return NextResponse.json({ error: "Server error during upload." }, { status: 500 });
  }
}