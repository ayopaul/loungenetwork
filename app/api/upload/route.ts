// app/api/upload/route.ts
import { writeFile, access, constants } from "fs/promises";
import { mkdirSync, existsSync } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { requireAuth, sanitizePath, isPathSafe } from "@/lib/apiAuth";

// Use absolute path outside project directory
const UPLOAD_BASE_DIR = "/var/uploads/loungenetwork";
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: Request) {
  const auth = await requireAuth();
  if (!auth.authorized) return auth.response;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    // Validate file type using allowlist
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Only image uploads are allowed" }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large. Maximum size is 5MB" }, { status: 400 });
    }

    const originalName = file.name;
    const customFilename = formData.get("filename") as string;

    // Clean and sanitize filename
    let filename = sanitizePath(customFilename || originalName);
    filename = filename.replace(/[^a-zA-Z0-9.-]/g, "-");

    // Ensure filename has an extension
    if (!path.extname(filename)) {
      const originalExt = path.extname(originalName);
      filename += originalExt || '.jpg';
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Use external upload directory
    const uploadDir = path.join(UPLOAD_BASE_DIR, "oaps");
    const filePath = path.join(uploadDir, filename);

    // Verify path is safe
    if (!isPathSafe(filePath, uploadDir)) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
    }

    // Ensure directory exists
    try {
      if (!existsSync(uploadDir)) {
        mkdirSync(uploadDir, { recursive: true });
      }

      // Check if directory is writable
      await access(uploadDir, constants.W_OK);

    } catch {
      return NextResponse.json({ error: "Cannot access upload directory" }, { status: 500 });
    }

    try {
      await writeFile(filePath, buffer);
    } catch {
      return NextResponse.json({ error: "Failed to save file" }, { status: 500 });
    }

    // Generate URL - will be served by your API route
    const fileUrl = `/api/files/oaps/${filename}`;

    return NextResponse.json({
      url: fileUrl,
      filename,
      size: file.size,
      type: file.type
    });

  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}