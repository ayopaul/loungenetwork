// app/api/oaps/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { unlink } from "fs/promises";
import path from "path";
import type { NextRequest } from "next/server";

// Define the expected shape of the route context
type ParamsContext = {
  params: {
    id: string;
  };
};

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
  ) {
    try {
      const { id } = params;
  
      if (!id) {
        return NextResponse.json({ error: "Missing OAP ID" }, { status: 400 });
      }
  
      const existingOAP = await prisma.oAP.findUnique({ where: { id } });
  
      if (!existingOAP) {
        return NextResponse.json({ error: "OAP not found" }, { status: 404 });
      }
  
      await prisma.oAP.delete({ where: { id } });
  
      if (existingOAP.photoUrl) {
        try {
          const filename = existingOAP.photoUrl.split("/").pop();
          if (filename) {
            const filePath = path.join(process.cwd(), "public", "oaps", filename);
            await unlink(filePath);
            console.log(`Deleted photo file: ${filePath}`);
          }
        } catch (fileError) {
          console.warn("Could not delete photo file:", fileError);
        }
      }
  
      return NextResponse.json({
        message: "OAP deleted successfully",
        deletedOAP: existingOAP,
      });
    } catch (err) {
      console.error("Delete OAP error:", err);
      return NextResponse.json(
        {
          error: "Internal server error",
          details: err instanceof Error ? err.message : String(err),
        },
        { status: 500 }
      );
    }
  }