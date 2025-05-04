"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { SessionProvider } from "next-auth/react";
import { MenuIcon, XIcon } from "lucide-react";

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
  const [open, setOpen] = useState(false);

  return (
    <SessionProvider>
      {/* Mobile toggle button */}
        <div className="lg:hidden mb-4 flex items-center justify-between">
          <h3 className="text-lg font-medium">
            {items.find(item => item.value === current)?.label || "Navigation"}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(!open)}
            aria-label="Toggle navigation"
          >
            {open ? <XIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </Button>
        </div>


      {/* Sidebar nav */}
      <nav className={`${open ? "block" : "hidden"} lg:block flex flex-col gap-2 w-full`}>
        {items.map((item) => (
          <Button
            key={item.value}
            variant={current === item.value ? "secondary" : "ghost"}
            className={`justify-start w-full text-left px-4 py-2 ${
              current === item.value ? "font-semibold" : "text-muted-foreground"
            }`}
            onClick={() => {
              setOpen(false); // auto-close after selection on mobile
              onSelect(item.value);
            }}
          >
            {item.label}
          </Button>
        ))}

        <hr className="my-4 border-border" />

        <Button
          variant="destructive"
          className="justify-start w-full text-left px-4 py-2"
          onClick={() => {
            signOut({ callbackUrl: "/admin/login" });
          }}
        >
          Log out
        </Button>
      </nav>
    </SessionProvider>
  );
}
