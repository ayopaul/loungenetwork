// app/api/upload/shows/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { requireAuth, sanitizePath, isPathSafe } from '@/lib/apiAuth';

const UPLOAD_DIR = '/var/uploads/loungenetwork/shows';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.authorized) return auth.response;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const rawShowId = formData.get('showId') as string;
    const category = formData.get('category') as string || 'thumbnail'; // thumbnail, banner, etc.

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!rawShowId) {
      return NextResponse.json({ error: 'Show ID is required' }, { status: 400 });
    }

    // Sanitize showId to prevent directory traversal
    const showId = sanitizePath(rawShowId);

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Create upload directory if it doesn't exist
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    // Create show-specific directory
    const showDir = path.join(UPLOAD_DIR, showId);

    // Verify path is safe before creating directory
    if (!isPathSafe(showDir, UPLOAD_DIR)) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }

    if (!existsSync(showDir)) {
      await mkdir(showDir, { recursive: true });
    }

    // Generate unique filename
    const fileExtension = path.extname(file.name);
    const uniqueId = uuidv4();
    const fileName = `${category}-${uniqueId}${fileExtension}`;
    const filePath = path.join(showDir, fileName);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    await writeFile(filePath, buffer);

    // Generate the URL that will be used to access this file
    const fileUrl = `/api/files/shows/${showId}/${fileName}`;

    return NextResponse.json({
      success: true,
      fileName,
      fileUrl,
      size: file.size,
      type: file.type
    });

  } catch {
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}