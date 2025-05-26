// app/api/oaps/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const stationId = searchParams.get("stationId");

    const data = await prisma.oAP.findMany({
      where: stationId ? { stationId } : undefined,
      orderBy: { name: "asc" }
    });

    return NextResponse.json(data);
  } catch (err) {
    console.error("Error reading OAPs from database:", err);
    return new NextResponse("Failed to load OAPs", { status: 500 });
  }
}
