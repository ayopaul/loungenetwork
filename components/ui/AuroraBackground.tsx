"use client";
import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";
import { useTheme } from "next-themes";

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
  showRadialGradient?: boolean;
}

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const gradient = isDark
    ? "repeating-linear-gradient(100deg, #7928ca 10%, #2d2a55 15%, #3b0764 20%, #1f2937 25%, #4c1d95 30%)"
    : "repeating-linear-gradient(100deg, #3b82f6 10%, #a5b4fc 15%, #93c5fd 20%, #ddd6fe 25%, #60a5fa 30%)";

  return (
    <main>
      <div
        className={cn(
          "transition-bg relative flex h-[100vh] flex-col items-center justify-center",
          isDark ? "bg-zinc-900 text-white" : "bg-white text-black",
          className
        )}
        {...props}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div
            className={cn(
              "animate-aurora pointer-events-none absolute -inset-[10px] opacity-40 blur-[10px] filter will-change-transform",
              showRadialGradient &&
                "[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,transparent_70%)]"
            )}
            style={{
                backgroundImage: gradient,
                backgroundSize: "400% 100%", // wide for horizontal motion
                backgroundPositionX: "0%",   // aligns with the animation
              }}                          
          />
        </div>
        {children}
      </div>
    </main>
  );
};
