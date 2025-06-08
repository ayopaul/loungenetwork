// app/api/schedule/save/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { stationId, scheduleSlot, schedule } = await req.json();

    if (!stationId) {
      return NextResponse.json({ error: "Missing stationId" }, { status: 400 });
    }

    // Handle single slot save (preferred)
    if (scheduleSlot) {
      const slot = scheduleSlot;
      
      if (!slot.showTitle || !slot.startTime || !slot.endTime) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }

      // Generate slug if not provided
      const slug = slot.slug || `${slot.showTitle.toLowerCase().replace(/\s+/g, '-')}-${slot.startTime.replace(':', '')}`;

      // Handle thumbnail URL - if it's a file path, convert to API URL
      let thumbnailUrl = slot.thumbnailUrl || '/placeholder-image.svg';
      if (thumbnailUrl.startsWith('/var/uploads/loungenetwork/shows/')) {
        // Convert file system path to API URL
        const relativePath = thumbnailUrl.replace('/var/uploads/loungenetwork/shows/', '');
        thumbnailUrl = `/api/files/shows/${relativePath}`;
      }

      const slotData = {
        showTitle: slot.showTitle,
        startTime: slot.startTime,
        endTime: slot.endTime,
        description: slot.description || '',
        thumbnailUrl: thumbnailUrl,
        weekday: slot.weekday,
        slug: slug,
        stationId: stationId,
      };

      let savedSlot;

      if (slot.id && !slot.id.startsWith('new-')) {
        // Update existing slot
        savedSlot = await prisma.schedule.update({
          where: { id: slot.id },
          data: slotData,
        });
      } else {
        // Create new slot
        savedSlot = await prisma.schedule.create({
          data: {
            id: `${slug}-${Date.now()}`,
            ...slotData,
          },
        });
      }

      return NextResponse.json({ 
        success: true, 
        scheduleSlot: savedSlot 
      });
    }

    // Handle array of slots (legacy support)
    if (schedule && Array.isArray(schedule)) {
      const savedSlots = [];
      
      for (const slot of schedule) {
        if (!slot.showTitle || !slot.startTime || !slot.endTime) {
          continue; // Skip invalid slots
        }

        const slug = slot.slug || `${slot.showTitle.toLowerCase().replace(/\s+/g, '-')}-${slot.startTime.replace(':', '')}`;

        // Handle thumbnail URL - if it's a file path, convert to API URL
        let thumbnailUrl = slot.thumbnailUrl || '/placeholder-image.svg';
        if (thumbnailUrl.startsWith('/var/uploads/loungenetwork/shows/')) {
          // Convert file system path to API URL
          const relativePath = thumbnailUrl.replace('/var/uploads/loungenetwork/shows/', '');
          thumbnailUrl = `/api/files/shows/${relativePath}`;
        }

        const slotData = {
          showTitle: slot.showTitle,
          startTime: slot.startTime,
          endTime: slot.endTime,
          description: slot.description || '',
          thumbnailUrl: thumbnailUrl,
          weekday: slot.weekday,
          slug: slug,
          stationId: stationId,
        };

        let savedSlot;

        if (slot.id && !slot.id.startsWith('new-')) {
          // Update existing slot
          savedSlot = await prisma.schedule.update({
            where: { id: slot.id },
            data: slotData,
          });
        } else {
          // Create new slot
          savedSlot = await prisma.schedule.create({
            data: {
              id: `${slug}-${Date.now()}`,
              ...slotData,
            },
          });
        }

        savedSlots.push(savedSlot);
      }

      return NextResponse.json({ 
        success: true, 
        schedule: savedSlots 
      });
    }

    return NextResponse.json({ error: "No valid data provided" }, { status: 400 });

  } catch (error) {
    console.error("Schedule save error:", error);
    return NextResponse.json(
      { error: "Failed to save schedule" }, 
      { status: 500 }
    );
  }
}