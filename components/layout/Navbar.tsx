// components/layout/Navbar.tsx
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

        <ul className="flex gap-6 text-sm items-center">
          <li>
            <Link href="/blog" className="hover:underline">Blog</Link>
          </li>
          <li>
            <Link href="/team" className="hover:underline">OAPs</Link>
          </li>
          <li>
            <Link href="/about" className="hover:underline">About</Link>
          </li>
          

          <ThemeToggle />
        </ul>
      </div>
    </nav>
  );
}
