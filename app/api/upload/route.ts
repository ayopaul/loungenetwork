// app/api/upload/route.ts
import { writeFile } from "fs/promises";
import { mkdirSync, existsSync } from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image uploads are allowed" }, { status: 400 });
    }

    // Validate file size (e.g., max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Maximum size is 5MB" }, { status: 400 });
    }

    const originalName = file.name;
    const customFilename = formData.get("filename") as string;
    
    // Clean filename and ensure it has proper extension
    let filename = customFilename || originalName;
    filename = path.basename(filename).replace(/\s+/g, "-");
    
    // Ensure filename has an extension
    if (!path.extname(filename)) {
      const originalExt = path.extname(originalName);
      filename += originalExt || '.jpg';
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const uploadDir = path.join(process.cwd(), "public", "oaps");
    
    // Ensure directory exists
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);
    
    try {
      await writeFile(filePath, buffer);
      console.log(`Successfully saved upload to: ${filePath}`);
    } catch (writeError) {
      console.error("Error writing file:", writeError);
      return NextResponse.json({ error: "Failed to save file" }, { status: 500 });
    }

    // Generate URL based on environment
    const baseUrl = process.env.NODE_ENV === "production"
      ? "https://loungenetwork.ng"
      : "http://localhost:3000";
    
    const fileUrl = `${baseUrl}/oaps/${filename}`;
    
    return NextResponse.json({ 
      url: fileUrl,
      filename,
      size: file.size,
      type: file.type
    });
    
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}