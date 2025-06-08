// not used
"use client";

import { PlayIcon } from "lucide-react";

export default function FloatingPlayer() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-secondary text-black px-6 py-3 flex items-center justify-between z-50 shadow-[0_-2px_5px_rgba(0,0,0,0.2)]">
      <div className="font-semibold">🔴 Live – Morning Groove</div>
      <button className="bg-accent p-2 rounded-full text-white">
        <PlayIcon />
      </button>
    </div>
  );
}
