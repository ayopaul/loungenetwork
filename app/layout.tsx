'use client';


import "@/styles/globals.css"; // <- This must be at the top
import PlayerBar from "@/components/radio/PlayerBar";
import GlobalAudioPlayer from "@/components/player/GlobalAudioPlayer";
import dynamic from "next/dynamic";

// Dynamically import the client-only component
const PlayerDock = dynamic(() => import('@/components/player/PlayerDock'), {
  ssr: false, // ❗ Disables server-side rendering for this component
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}

        {/* Safe to render now! */}
        <PlayerDock />
      </body>
    </html>
  );
}
