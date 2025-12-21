// components/theme-provider.tsx
"use client";

import React, { PropsWithChildren, useState, useEffect } from "react";
import {
  ThemeProvider as NextThemesProvider,
  ThemeProviderProps as NextThemesProviderProps,
} from "next-themes";

// Wrap NextThemesProviderProps with React’s children
type Props = PropsWithChildren<NextThemesProviderProps>;

export function ThemeProvider({ children, ...props }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Return children with suppressHydrationWarning to avoid hydration mismatch
  // while still rendering content during SSR
  if (!mounted) {
    return <div suppressHydrationWarning>{children}</div>;
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
