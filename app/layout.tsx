'use client';

import "@/styles/globals.css";
import dynamic from "next/dynamic";
import { ThemeProvider } from "next-themes";
import { Inter } from "next/font/google";
import { Mounted } from "@/components/Mounted";

const inter = Inter({ subsets: ["latin"] });

const PlayerDock = dynamic(() => import('@/components/player/PlayerDock'), {
  ssr: false,
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Mounted>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <PlayerDock />
        </ThemeProvider> </Mounted>
      </body>
    </html>
  );
}
