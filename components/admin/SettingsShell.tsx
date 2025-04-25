'use client';

import React from 'react';
import { SidebarNav } from './SidebarNav';
import ThemeToggle from './ThemeToggle';
import { Button } from "@/components/ui/button";

type NavItem = {
  label: string;
  value: string;
};

interface SettingsShellProps {
  title: string;
  description: string;
  nav: NavItem[];
  current: string;
  onSelect: (value: string) => void;
  children: React.ReactNode;
}

export default function SettingsShell({
  title,
  description,
  nav,
  current,
  onSelect,
  children,
}: SettingsShellProps) {
  const handleLogout = () => {
    localStorage.removeItem("admin-password");
    window.location.href = "/admin"; // ✅ force reload
  };
  

  return (
    <div className="space-y-6 p-10 pb-16 bg-background text-foreground min-h-screen">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
        </div>

        {/* Right-side controls */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button variant="outline" onClick={handleLogout}>
            Log out
          </Button>

        </div>
      </div>

      <hr className="border-t border-border" />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <aside className="lg:col-span-1">
          <SidebarNav items={nav} current={current} onSelect={onSelect} />
        </aside>

        <div className="lg:col-span-4">{children}</div>
      </div>
    </div>
  );
}
