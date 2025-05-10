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
    ? "repeating-linear-gradient(100deg, #ff0034 10%, #fe51ba 15%, #ff825d 20%, #b50418 25%,rgb(196, 7, 7) 30%)"
    : "repeating-linear-gradient(100deg, #ff0034 10%,rgb(255, 79, 3) 15%, #f03d9a 20%, #fa010b 25%, #ff0034 30%)";

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
