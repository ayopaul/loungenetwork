// app/layout.tsx
import "@/styles/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import PlayerDock from "@/components/player/PlayerDock";
import Navbar from "@/components/layout/Navbar";

export const metadata = {
  title: "Lounge Network",
  description: "Streaming radio across stations and shows",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="min-h-screen bg-background text-foreground">
            {children}
          </div>
          <PlayerDock />
        </ThemeProvider>
      </body>
    </html>
  );
}
