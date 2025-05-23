// components/layout/Navbar.tsx
"use client";

import Link from "next/link";
import { MenuIcon } from "lucide-react";
import ThemeToggle from "../admin/ThemeToggle";
import ShowSearchDialog from "@/components/shared/ShowSearchDialog";
import schedules from "@/data/schedules.json";
import { StationSelect } from "@/components/station/StationSelect";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import SearchInput from "@/components/shared/SearchInput";


const allShows = Object.values(schedules).flat()

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-background/70 backdrop-blur-lg border-b border-border transition-all">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="font-bold text-lg">
          Lounge Network
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex gap-6 text-sm items-center">
          <li>
            <Link href="/blog" className="hover:underline">Blog</Link>
          </li>
          <li>
            <Link href="/team" className="hover:underline">OAPs</Link>
          </li>
          <li>
            <Link href="/about" className="hover:underline">About</Link>
          </li>
          <li>
          <ShowSearchDialog shows={allShows} />
          </li>
          <li>
            <ThemeToggle />
          </li>
          <li>
          <StationSelect />
          </li>
        </ul>

        {/* Mobile nav */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 rounded-md hover:bg-muted">
                <MenuIcon className="w-5 h-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/blog">Blog</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/team">OAPs</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/about">About</Link>
              </DropdownMenuItem>
              <div className="px-2 py-1">
                <StationSelect />
              </div>
              <DropdownMenuItem asChild>
              <ShowSearchDialog shows={allShows} />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
        </div>
      </div>
 
    </nav>
  );
}
