// app/api/stations/save/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const newStation = await req.json();

    if (!newStation?.id || !newStation?.name || !newStation?.streamUrl) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await prisma.station.upsert({
      where: { id: newStation.id },
      update: {
        name: newStation.name,
        streamUrl: newStation.streamUrl
      },
      create: {
        id: newStation.id,
        name: newStation.name,
        streamUrl: newStation.streamUrl
      }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error saving station:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
