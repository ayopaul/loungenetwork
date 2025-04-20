'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils'; // assumes you're using ShadCN's `cn` utility

type SidebarNavItem = {
  label: string;
  value: string;
};

type Props = {
  items: SidebarNavItem[];
  current: string;
  onSelect: (value: string) => void;
};

export function SidebarNav({ items, current, onSelect }: Props) {
  return (
    <nav className="flex flex-col space-y-1 text-sm">
      {items.map((item) => (
        <button
          key={item.value}
          onClick={() => onSelect(item.value)}
          className={cn(
            'text-left px-3 py-2 rounded-md font-medium transition-colors',
            current === item.value
              ? 'bg-muted text-foreground'
              : 'text-muted-foreground hover:text-primary'
          )}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}
