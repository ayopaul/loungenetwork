// app/api/files/shows/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { lookup } from 'mime-types';

const UPLOAD_DIR = '/var/uploads/loungenetwork/shows';
const PUBLIC_FALLBACK_DIRS = [
  process.cwd() + '/public/shows',
  process.cwd() + '/public/thumbnails',
  process.cwd() + '/public'
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const pathSegments = resolvedParams.path;
    
    if (!pathSegments || pathSegments.length === 0) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }

    // Reconstruct the file path from segments
    const filePath = path.join(UPLOAD_DIR, ...pathSegments);

    // Security check: make sure the path is within the upload directory
    const normalizedPath = path.normalize(filePath);
    const normalizedUploadDir = path.normalize(UPLOAD_DIR);

    if (!normalizedPath.startsWith(normalizedUploadDir)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if file exists in primary location
    let actualFilePath = filePath;
    if (!existsSync(filePath)) {
      // Fallback: check public directories for backward compatibility
      let found = false;
      for (const fallbackDir of PUBLIC_FALLBACK_DIRS) {
        const fallbackPath = path.join(fallbackDir, ...pathSegments);
        if (existsSync(fallbackPath)) {
          actualFilePath = fallbackPath;
          found = true;
          break;
        }
      }
      if (!found) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
      }
    }

    try {
      // Get file stats
      const stats = await stat(actualFilePath);

      if (!stats.isFile()) {
        return NextResponse.json({ error: 'Not a file' }, { status: 400 });
      }

      // Read the file
      const fileBuffer = await readFile(actualFilePath);

      // Get the file extension and determine MIME type
      const fileExtension = path.extname(actualFilePath);
      const mimeType = lookup(fileExtension) || 'application/octet-stream';

      // Return the file with appropriate headers
      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': mimeType,
          'Content-Length': stats.size.toString(),
          'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
          'Content-Disposition': 'inline', // Display in browser instead of download
        },
      });

    } catch (fileError) {
      console.error('Error reading show file:', fileError);
      return NextResponse.json({ 
        error: 'Failed to read file',
        details: fileError instanceof Error ? fileError.message : 'Unknown error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Show file serving error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}