// middleware.ts
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  const { pathname } = request.nextUrl;

  // If it's the login page, allow it through without redirect
  if (pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  // Protect all other /admin routes
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute && !token) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Only run middleware on /admin/*
export const config = {
  matcher: [
    "/admin/:path*",
  ],
};
