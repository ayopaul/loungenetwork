// components/admin/SettingsShell.tsx
"use client";

import { useState, useEffect } from "react";
import { SidebarNav } from "@/components/admin/SidebarNav";
import ThemeToggle from "@/components/admin/ThemeToggle";

interface NavItem {
  label: string;
  value: string;
}

interface SettingsShellProps {
  title: string;
  description: string;
  nav: NavItem[];
  current: string;
  onSelect: (val: string) => void;
  children: React.ReactNode;
}

export function SettingsShell({
  title,
  description,
  nav,
  current,
  onSelect,
  children,
}: SettingsShellProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-10 pb-16 bg-background text-foreground min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="sm:w-4/5">
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <div className="sm:w-1/5 sm:flex sm:justify-end">
          <ThemeToggle />
        </div>
      </div>


      <hr className="border-t border-border" />

      {/* Main content area */}
      <div className="flex flex-col lg:grid lg:grid-cols-5 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <SidebarNav items={nav} current={current} onSelect={onSelect} />
        </aside>

        {/* Content */}
        <div className="lg:col-span-4 w-full">{children}</div>
      </div>
    </div>
  );
}
