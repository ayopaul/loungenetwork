// components/layout/Navbar.tsx
import Link from "next/link";
import ThemeToggle from "../admin/ThemeToggle";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-background/70 backdrop-blur-lg border-b border-border transition-all">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="font-bold text-lg">
          Lounge Network
        </Link>

        <ul className="flex gap-4 text-sm items-center">
          <li>
            <a href="#schedule" className="hover:underline">Schedule</a>
          </li>
          <li>
            <Link href="/admin" className="hover:underline">Admin</Link>
          </li>
          <ThemeToggle />
        </ul>
      </div>
    </nav>
  );
}
