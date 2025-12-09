// lib/apiAuth.ts
import { getServerSession } from "next-auth";
import { authOptions } from "./authOptions";
import { NextResponse } from "next/server";

export async function requireAuth() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    };
  }

  return { authorized: true, session };
}

// Sanitize path segments to prevent directory traversal
export function sanitizePath(segment: string): string {
  // Remove any path traversal attempts and special characters
  return segment
    .replace(/\.\./g, '')
    .replace(/[\/\\]/g, '')
    .replace(/^\.+/, '')
    .trim();
}

// Validate that a path stays within the allowed directory
export function isPathSafe(filePath: string, allowedDir: string): boolean {
  const path = require('path');
  const resolvedPath = path.resolve(filePath);
  const resolvedAllowedDir = path.resolve(allowedDir);
  return resolvedPath.startsWith(resolvedAllowedDir + path.sep) || resolvedPath === resolvedAllowedDir;
}
