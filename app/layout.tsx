// app/layout.tsx
import "@/styles/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProviderWrapper } from "@/components/SessionProviderWrapper";
import PlayerDock from "@/components/player/PlayerDock";
import Navbar from "@/components/layout/Navbar";
import { Toaster } from "sonner";
import GlobalAudioProvider from "@/components/player/GlobalAudioProvider"; // ✅ Import added

export const metadata = {
  title: "Lounge Network",
  description: "Streaming radio across stations and shows",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <SessionProviderWrapper>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <GlobalAudioProvider>
            <div className="min-h-screen bg-background text-foreground">
              {children}
            </div>
            <PlayerDock />
          </GlobalAudioProvider>
          </ThemeProvider>
        </SessionProviderWrapper>
        <Toaster />
      </body>
    </html>
  );
}
