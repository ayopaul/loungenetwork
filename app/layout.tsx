// app/layout.tsx
'use client';

import "@/styles/globals.css";
import { ThemeProvider } from "@/components/theme-provider"; // import correctly
import PlayerDock from "@/components/player/PlayerDock";
import Navbar from "@/components/layout/Navbar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <PlayerDock />
        </ThemeProvider>
      </body>
    </html>
  );
}
