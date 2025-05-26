// app/api/oaps/save/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { stationId, oaps } = await req.json();

    if (!stationId || !Array.isArray(oaps)) {
      return NextResponse.json({ error: "Missing stationId or invalid OAPs" }, { status: 400 });
    }

    // Remove existing OAPs for this station
    await prisma.oAP.deleteMany({
      where: { stationId }
    });

    // Insert new ones
    for (const oap of oaps) {
      await prisma.oAP.create({
        data: oap
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error saving OAPs:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
