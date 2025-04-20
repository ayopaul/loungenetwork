import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      id: "lounge877",
      name: "Lounge 87.7 FM",
      streamUrl: "https://lounge877fmlagos-atunwadigital.streamguys1.com/lounge877fmlagos"
    },
    {
      id: "coolfm",
      name: "Cool FM",
      streamUrl: "https://your-coolfm-stream-url.com"
    },
    {
      id: "vibesradio",
      name: "Vibes Radio",
      streamUrl: "https://your-vibesradio-stream-url.com"
    }
  ]);
}
