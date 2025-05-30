// app/api/oaps/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { unlink } from "fs/promises";
import path from "path";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "Missing OAP ID" }, { status: 400 });
    }

    // First, get the OAP to check if it has a photo that needs to be deleted
    const existingOAP = await prisma.oAP.findUnique({
      where: { id },
    });

    if (!existingOAP) {
      return NextResponse.json({ error: "OAP not found" }, { status: 404 });
    }

    // Delete the OAP from database
    await prisma.oAP.delete({
      where: { id },
    });

    // Try to delete the associated photo file if it exists
    if (existingOAP.photoUrl) {
      try {
        // Extract filename from URL
        const urlParts = existingOAP.photoUrl.split('/');
        const filename = urlParts[urlParts.length - 1];
        
        if (filename && filename !== '') {
          const filePath = path.join(process.cwd(), "public", "oaps", filename);
          await unlink(filePath);
          console.log(`Deleted photo file: ${filePath}`);
        }
      } catch (fileError) {
        // Don't fail the entire operation if we can't delete the file
        console.warn("Could not delete photo file:", fileError);
      }
    }

    return NextResponse.json({ 
      message: "OAP deleted successfully",
      deletedOAP: existingOAP 
    });

  } catch (err) {
    console.error("Delete OAP error:", err);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: err instanceof Error ? err.message : String(err) 
      },
      { status: 500 }
    );
  }
}