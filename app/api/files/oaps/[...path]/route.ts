// app/api/files/oaps/[...path]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { readFile, access, stat } from "fs/promises";
import path from "path";
import { lookup } from "mime-types";

const UPLOAD_BASE_DIR = "/var/uploads/loungenetwork";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    const filePath = path.join(UPLOAD_BASE_DIR, "oaps", ...pathSegments);
    
    // Security check - ensure file is within oaps directory
    const resolvedPath = path.resolve(filePath);
    const oapsDir = path.resolve(UPLOAD_BASE_DIR, "oaps");
    
    if (!resolvedPath.startsWith(oapsDir)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Check if file exists and get stats
    await access(filePath);
    const stats = await stat(filePath);
    
    const fileBuffer = await readFile(filePath);
    
    // Determine content type
    const mimeType = lookup(filePath) || "application/octet-stream";
    
    // Set appropriate headers
    const response = new NextResponse(fileBuffer);
    response.headers.set("Content-Type", mimeType);
    response.headers.set("Content-Length", stats.size.toString());
    response.headers.set("Cache-Control", "public, max-age=31536000, immutable");
    response.headers.set("Last-Modified", stats.mtime.toUTCString());
    
    return response;
  } catch (error) {
    console.error("File serving error:", error);
    return new NextResponse("File not found", { status: 404 });
  }
}