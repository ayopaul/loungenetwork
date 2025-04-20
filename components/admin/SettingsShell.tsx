'use client';

import React from 'react';
import { SidebarNav } from './SidebarNav';

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
  return (
    <div className="space-y-6 p-10 pb-16 block">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
        <hr className="my-6 border-t border-border" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <aside className="lg:col-span-1">
          <SidebarNav items={nav} current={current} onSelect={onSelect} />
        </aside>
        <div className="lg:col-span-4">{children}</div>
      </div>
    </div>
  );
}
