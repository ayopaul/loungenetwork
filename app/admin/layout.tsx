// app/admin/layout.tsx
import { ThemeProvider } from "next-themes";
import { Inter } from "next/font/google";
import { Mounted } from "@/components/Mounted";
import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={inter.className}>
        <Mounted>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
          </ThemeProvider>
        </Mounted>
      </body>
    </html>
  );
}