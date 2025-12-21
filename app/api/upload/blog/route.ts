// app/api/upload/blog/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { lookup } from 'mime-types';
import { requireAuth, sanitizePath, isPathSafe } from '@/lib/apiAuth';

const UPLOAD_DIR = '/var/uploads/loungenetwork/blog';

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.authorized) return auth.response;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const rawStationId = formData.get('stationId') as string;
    const rawPostId = formData.get('postId') as string;
    const type = formData.get('type') as string; // 'cover' or 'content'

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!rawStationId) {
      return NextResponse.json({ error: 'Station ID required' }, { status: 400 });
    }

    // Sanitize path parameters to prevent directory traversal
    const stationId = sanitizePath(rawStationId);
    const postId = rawPostId ? sanitizePath(rawPostId) : '';

    // Validate file type
    const mimeType = lookup(file.name);
    if (!mimeType || !mimeType.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid file type. Only images are allowed.' }, { status: 400 });
    }

    // Create directory structure: /var/uploads/loungenetwork/blog/{stationId}/{postId}/
    const stationDir = path.join(UPLOAD_DIR, stationId);
    const postDir = postId ? path.join(stationDir, postId) : stationDir;

    // Verify paths are safe
    if (!isPathSafe(stationDir, UPLOAD_DIR) || (postId && !isPathSafe(postDir, UPLOAD_DIR))) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }
    
    try {
      if (!existsSync(stationDir)) {
        await mkdir(stationDir, { recursive: true });
      }

      if (postId && !existsSync(postDir)) {
        await mkdir(postDir, { recursive: true });
      }
    } catch (dirError) {
      console.error("Failed to create upload directory:", postDir || stationDir, dirError);
      return NextResponse.json({
        error: "Server configuration error: Cannot create upload directory",
        details: dirError instanceof Error ? dirError.message : String(dirError)
      }, { status: 500 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = path.extname(file.name);
    const baseName = file.name.replace(fileExtension, '').replace(/[^a-zA-Z0-9-_]/g, '-');
    const fileName = `${timestamp}-${baseName}${fileExtension}`;
    
    // Add type prefix for organization
    const finalFileName = type === 'cover' ? `cover-${fileName}` : `content-${fileName}`;
    
    const filePath = path.join(postDir, finalFileName);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    try {
      await writeFile(filePath, buffer);
    } catch (writeError) {
      console.error("Failed to write file:", filePath, writeError);
      return NextResponse.json({
        error: "Failed to save file to disk",
        details: writeError instanceof Error ? writeError.message : String(writeError)
      }, { status: 500 });
    }

    // Generate the URL path for serving the file
    const urlPath = postId 
      ? `/api/files/blog/${stationId}/${postId}/${finalFileName}`
      : `/api/files/blog/${stationId}/${finalFileName}`;

    return NextResponse.json({
      success: true,
      filename: finalFileName,
      url: urlPath,
      size: file.size,
      type: file.type,
      uploadType: type
    });

  } catch (error) {
    console.error('Blog upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

// Optional: Handle DELETE requests for image cleanup
export async function DELETE(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const rawStationId = searchParams.get('stationId');
    const rawPostId = searchParams.get('postId');
    const rawFilename = searchParams.get('filename');

    if (!rawStationId || !rawFilename) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Sanitize all path components
    const stationId = sanitizePath(rawStationId);
    const postId = rawPostId ? sanitizePath(rawPostId) : '';
    const filename = sanitizePath(rawFilename);

    const filePath = postId
      ? path.join(UPLOAD_DIR, stationId, postId, filename)
      : path.join(UPLOAD_DIR, stationId, filename);

    // Verify path is safe before deletion
    if (!isPathSafe(filePath, UPLOAD_DIR)) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }

    if (existsSync(filePath)) {
      const { unlink } = await import('fs/promises');
      await unlink(filePath);
      return NextResponse.json({ success: true, message: 'File deleted' });
    } else {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

  } catch (error) {
    console.error('Blog delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}