// app/layout.tsx
import "@/styles/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProviderWrapper } from "@/components/SessionProviderWrapper";
import PlayerDock from "@/components/player/PlayerDock";
import Navbar from "@/components/layout/Navbar";
import { Toaster } from "sonner";
import GlobalAudioProvider from "@/components/player/GlobalAudioProvider";

import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata = {
  title: "Lounge Network",
  description: "Streaming radio across stations and shows",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={montserrat.variable} suppressHydrationWarning>
      <head>
        <link
          href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans">
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
