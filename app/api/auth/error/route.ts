// app/api/auth/error/route.ts
import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({ error: "Authentication failed" }, { status: 400 });
  }