// app/layout.tsx
'use client';

import { ThemeProvider } from "@/components/theme-provider"; // <-- your theme-provider file
import "@/styles/globals.css";
import Navbar from "@/components/layout/Navbar";
import GlobalAudioPlayer from "@/components/player/GlobalAudioPlayer";
import dynamic from "next/dynamic";

const PlayerDock = dynamic(() => import('@/components/player/PlayerDock'), { ssr: false });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <PlayerDock />
        </ThemeProvider>
      </body>
    </html>
  );
}
