// app/api/upload/blog/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { lookup } from 'mime-types';

const UPLOAD_DIR = '/var/uploads/loungenetwork/blog';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const stationId = formData.get('stationId') as string;
    const postId = formData.get('postId') as string;
    const type = formData.get('type') as string; // 'cover' or 'content'

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!stationId) {
      return NextResponse.json({ error: 'Station ID required' }, { status: 400 });
    }

    // Validate file type
    const mimeType = lookup(file.name);
    if (!mimeType || !mimeType.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid file type. Only images are allowed.' }, { status: 400 });
    }

    // Create directory structure: /var/uploads/loungenetwork/blog/{stationId}/{postId}/
    const stationDir = path.join(UPLOAD_DIR, stationId);
    const postDir = postId ? path.join(stationDir, postId) : stationDir;
    
    if (!existsSync(stationDir)) {
      await mkdir(stationDir, { recursive: true });
    }
    
    if (postId && !existsSync(postDir)) {
      await mkdir(postDir, { recursive: true });
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
    await writeFile(filePath, buffer);

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
  try {
    const { searchParams } = new URL(request.url);
    const stationId = searchParams.get('stationId');
    const postId = searchParams.get('postId');
    const filename = searchParams.get('filename');

    if (!stationId || !filename) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const filePath = postId 
      ? path.join(UPLOAD_DIR, stationId, postId, filename)
      : path.join(UPLOAD_DIR, stationId, filename);

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