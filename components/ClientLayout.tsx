//components/ClientLayout.tsx

"use client";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProviderWrapper } from "@/components/SessionProviderWrapper";
import PlayerDock from "@/components/player/PlayerDock";
import { Toaster } from "sonner";
import GlobalAudioProvider from "@/components/player/GlobalAudioProvider";
import { useHydrateStation } from "@/app/stores/useStationAdminStore";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  useHydrateStation();
  
  return (
    <SessionProviderWrapper>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <GlobalAudioProvider>
          <div className="min-h-screen bg-background text-foreground">
            {children}
          </div>
          <PlayerDock />
        </GlobalAudioProvider>
      </ThemeProvider>
      <Toaster />
    </SessionProviderWrapper>
  );
}