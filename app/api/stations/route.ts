// app/api/stations/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const stations = await prisma.station.findMany({
      orderBy: { name: "asc" }
    });
    return NextResponse.json(stations);
  } catch (err) {
    console.error("Error reading stations:", err);
    return NextResponse.json([], { status: 200 });
  }
}
