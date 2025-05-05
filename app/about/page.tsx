// app/about/page.tsx

// app/about/page.tsx or components/AboutUs.tsx
'use client'

import { Spotlight } from "@/components/ui/Spotlight"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { cn } from "@/lib/utils"

export default function AboutPage() {
  return (
    <div className="relative w-full min-h-screen bg-black/[0.96] antialiased flex flex-col overflow-hidden">
      {/* Navbar (always on top) */}
      <Navbar />

      {/* Background grid */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-0 select-none",
          "[background-size:40px_40px]",
          "[background-image:linear-gradient(to_right,#171717_1px,transparent_1px),linear-gradient(to_bottom,#171717_1px,transparent_1px)]"
        )}
      />

      {/* Spotlight layer */}
      <Spotlight className="absolute -top-40 left-0 md:-top-20 md:left-60 z-10" fill="white" />

      {/* Main content */}
      <main className="relative z-20 flex-grow w-full max-w-4xl mx-auto px-6 pt-24 pb-16">
        <h1 className="bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text text-center text-4xl font-bold text-transparent md:text-6xl">
          Welcome to Lounge Network
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-center text-base font-normal text-neutral-300">
          Lounge Network is an experimental low-powered FM station based in Lagos.
          We explore the intersection of music, culture, and community radio.
        </p>
        <p className="mx-auto mt-4 max-w-2xl text-center text-base font-normal text-neutral-300">
          Our goal is to create a sonic space that feels like home — where voices are heard,
          sounds are discovered, and local stories are amplified.
        </p>
        <p className="mx-auto mt-4 max-w-2xl text-center text-base font-normal text-neutral-300">
          Broadcasting from the heart of Lagos, we spotlight alternative sounds,
          genre-bending mixes, and conversations that matter.
        </p>
        <p className="mx-auto mt-4 max-w-2xl text-center text-base font-normal text-neutral-300">
          This isn’t just radio — it’s the pulse of a generation, heard live. Tune in. Lounge out.
          Let the frequency find you.
        </p>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}


