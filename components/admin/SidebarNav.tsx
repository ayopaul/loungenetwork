"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { SessionProvider } from "next-auth/react";

type NavItem = {
  label: string;
  value: string;
};

interface SidebarNavProps {
  items: NavItem[];
  current: string;
  onSelect: (value: string) => void;
}

export function SidebarNav({ items, current, onSelect }: SidebarNavProps) {
  return (
    <SessionProvider>
    <nav className="flex flex-col space-y-2">
      {items.map((item) => (
        <Button
          key={item.value}
          variant={current === item.value ? "secondary" : "ghost"}
          className="justify-start"
          onClick={() => onSelect(item.value)}
        >
          {item.label}
        </Button>
      ))}

      <hr className="my-4 border-border" />

      {/* Logout Button */}
      <Button
        variant="destructive"
        className="justify-start"
        onClick={() => {
          signOut({ callbackUrl: "/admin/login" }); // 👈 force redirect to login page after logout
        }}
      >
        Log out
      </Button>

    </nav></SessionProvider>
  );
}
