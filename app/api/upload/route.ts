// app/api/upload/route.ts
import { writeFile, access, constants } from "fs/promises";
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
    
    // For standalone deployment, files should go to the standalone public directory
    // Check multiple possible locations
    const possibleDirs = [
      path.join(process.cwd(), "public", "oaps"),  // Current directory
      path.join("/var/www/loungenetwork", "public", "oaps"),  // Absolute path
      path.join("/var/www/loungenetwork", ".next", "standalone", "public", "oaps"),  // Standalone
    ];
    
    let uploadDir = "";
    
    // Find the correct directory
    for (const dir of possibleDirs) {
      try {
        if (existsSync(path.dirname(dir))) {
          uploadDir = dir;
          break;
        }
      } catch (e) {
        // Continue to next option
      }
    }
    
    if (!uploadDir) {
      // Default to current working directory + public/oaps
      uploadDir = path.join(process.cwd(), "public", "oaps");
    }
    
    console.log("🔍 Upload Debug Info:");
    console.log("- Current working directory:", process.cwd());
    console.log("- Upload directory:", uploadDir);
    console.log("- Filename:", filename);
    console.log("- File size:", file.size);
    console.log("- File type:", file.type);
    
    // Ensure directory exists
    try {
      if (!existsSync(uploadDir)) {
        console.log("📁 Creating upload directory...");
        mkdirSync(uploadDir, { recursive: true });
      }
      
      // Check if directory is writable
      await access(uploadDir, constants.W_OK);
      console.log("✅ Upload directory is writable");
      
    } catch (dirError) {
      console.error("❌ Directory error:", dirError);
      return NextResponse.json({ 
        error: "Cannot access upload directory", 
        details: dirError instanceof Error ? dirError.message : String(dirError) 
      }, { status: 500 });
    }

    const filePath = path.join(uploadDir, filename);
    console.log("📄 Full file path:", filePath);
    
    try {
      await writeFile(filePath, buffer);
      console.log("✅ Successfully saved file to:", filePath);
      
      // Verify file was written
      try {
        await access(filePath, constants.R_OK);
        console.log("✅ File is readable after write");
      } catch (readError) {
        console.error("❌ File not readable after write:", readError);
      }
      
    } catch (writeError) {
      console.error("❌ Error writing file:", writeError);
      return NextResponse.json({ 
        error: "Failed to save file", 
        details: writeError instanceof Error ? writeError.message : String(writeError) 
      }, { status: 500 });
    }

    // Generate URL - adjust this based on your domain
    const fileUrl = `/oaps/${filename}`;
    console.log("🔗 Generated URL:", fileUrl);
    
    return NextResponse.json({ 
      url: fileUrl,
      filename,
      size: file.size,
      type: file.type,
      fullPath: filePath, // For debugging
      debug: {
        uploadDir,
        exists: existsSync(filePath)
      }
    });
    
  } catch (error) {
    console.error("💥 Upload error:", error);
    return NextResponse.json(
      { 
        error: "Upload failed", 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}