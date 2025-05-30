// app/api/upload/route.ts
import { writeFile } from "fs/promises";
import { mkdirSync } from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image uploads are allowed" }, { status: 400 });
  }

  const originalName = file.name;
  const filename = path
    .basename((formData.get("filename") as string) || originalName)
    .replace(/\s+/g, "-");

  const buffer = Buffer.from(await file.arrayBuffer());

  const uploadDir = path.join(process.cwd(), "public", "oaps");
  mkdirSync(uploadDir, { recursive: true });

  const filePath = path.join(uploadDir, filename);
  await writeFile(filePath, buffer);

  console.log(`Saved upload to: ${filePath}`);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return NextResponse.json({ url: `${baseUrl}/oaps/${filename}` });
}