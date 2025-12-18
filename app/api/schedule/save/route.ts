// app/api/schedule/save/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAuth } from "@/lib/apiAuth";
import type { Schedule } from "@/types/supabase";

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (!auth.authorized) return auth.response;

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
        const relativePath = thumbnailUrl.replace('/var/uploads/loungenetwork/shows/', '');
        thumbnailUrl = `/api/files/shows/${relativePath}`;
      }

      const slotData = {
        show_title: slot.showTitle,
        start_time: slot.startTime,
        end_time: slot.endTime,
        description: slot.description || '',
        thumbnail_url: thumbnailUrl,
        weekday: slot.weekday,
        slug: slug,
        station_id: stationId,
      };

      let savedSlot: Schedule;

      if (slot.id && !slot.id.startsWith('new-')) {
        // Update existing slot
        const { data, error } = await supabaseAdmin
          .from("schedules")
          .update(slotData)
          .eq("id", slot.id)
          .select()
          .single();

        if (error) throw error;
        savedSlot = data as Schedule;
      } else {
        // Create new slot
        const { data, error } = await supabaseAdmin
          .from("schedules")
          .insert({
            id: `${slug}-${Date.now()}`,
            ...slotData,
          })
          .select()
          .single();

        if (error) throw error;
        savedSlot = data as Schedule;
      }

      // Transform response to camelCase
      const transformedSlot = {
        id: savedSlot.id,
        showTitle: savedSlot.show_title,
        slug: savedSlot.slug,
        startTime: savedSlot.start_time,
        endTime: savedSlot.end_time,
        description: savedSlot.description,
        thumbnailUrl: savedSlot.thumbnail_url,
        weekday: savedSlot.weekday,
        stationId: savedSlot.station_id,
      };

      return NextResponse.json({
        success: true,
        scheduleSlot: transformedSlot
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

        let thumbnailUrl = slot.thumbnailUrl || '/placeholder-image.svg';
        if (thumbnailUrl.startsWith('/var/uploads/loungenetwork/shows/')) {
          const relativePath = thumbnailUrl.replace('/var/uploads/loungenetwork/shows/', '');
          thumbnailUrl = `/api/files/shows/${relativePath}`;
        }

        const slotData = {
          show_title: slot.showTitle,
          start_time: slot.startTime,
          end_time: slot.endTime,
          description: slot.description || '',
          thumbnail_url: thumbnailUrl,
          weekday: slot.weekday,
          slug: slug,
          station_id: stationId,
        };

        let savedSlot: Schedule;

        if (slot.id && !slot.id.startsWith('new-')) {
          const { data, error } = await supabaseAdmin
            .from("schedules")
            .update(slotData)
            .eq("id", slot.id)
            .select()
            .single();

          if (error) throw error;
          savedSlot = data as Schedule;
        } else {
          const { data, error } = await supabaseAdmin
            .from("schedules")
            .insert({
              id: `${slug}-${Date.now()}`,
              ...slotData,
            })
            .select()
            .single();

          if (error) throw error;
          savedSlot = data as Schedule;
        }

        savedSlots.push({
          id: savedSlot.id,
          showTitle: savedSlot.show_title,
          slug: savedSlot.slug,
          startTime: savedSlot.start_time,
          endTime: savedSlot.end_time,
          description: savedSlot.description,
          thumbnailUrl: savedSlot.thumbnail_url,
          weekday: savedSlot.weekday,
          stationId: savedSlot.station_id,
        });
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
