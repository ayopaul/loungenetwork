import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full bg-primary text-white px-6 py-4 flex items-center justify-between shadow-md sticky top-0 z-50">
      <Link href="/" className="flex items-center space-x-2">
        <Image src="/logo.svg" alt="Lounge Network" width={36} height={36} />
        <span className="font-bold text-lg">Lounge Network</span>
      </Link>

      <ul className="flex space-x-6 text-sm font-medium">
        <li><Link href="#schedule" className="hover:text-accent transition">Schedule</Link></li>
        <li><Link href="/admin" className="hover:text-accent transition">Admin</Link></li>
      </ul>
    </nav>
  );
}
