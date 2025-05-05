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
  if (!mounted) return null;
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
