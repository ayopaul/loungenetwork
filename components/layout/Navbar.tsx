import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-md border-b border-white/20 transition-all">
  <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
    <span className="font-bold text-lg">Lounge Network</span>
    <ul className="flex gap-4 text-sm">
      <li><a href="#schedule" className="hover:underline">Schedule</a></li>
      <li><a href="/admin" className="hover:underline">Admin</a></li>
    </ul>
  </div>
</nav>

  );
}
