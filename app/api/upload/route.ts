// app/api/upload/route.ts
import { writeFile } from "fs/promises";
import { mkdirSync } from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const filename = formData.get("filename") as string;

  if (!file || !filename) {
    return NextResponse.json({ error: "Missing file or filename" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const uploadDir = path.join(process.cwd(), "public", "oaps");
  mkdirSync(uploadDir, { recursive: true }); // ensures /public/oaps exists

  const filePath = path.join(uploadDir, filename);
  await writeFile(filePath, buffer);

  return NextResponse.json({ url: `/oaps/${filename}` });
}
