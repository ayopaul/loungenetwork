'use client';

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LivePlayer from "@/components/radio/LivePlayer";
import WeeklyTabs from "@/components/schedule/WeeklyTabs";
import { StationSelect } from "@/components/station/StationSelect";
import { useStationStore } from "@/stores/useStationStore";

export default function HomePage() {
  const { selected } = useStationStore(); // ✅ pull selected station at the top

  return (
    <div className="min-h-screen bg-primary text-white flex flex-col">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-10">
        <section className="relative h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden rounded-2xl mb-12">
          <div className="absolute inset-0 bg-[#7f1d1d]/70 backdrop-blur-sm z-10" />
          <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
            <source src="/media/hero-bg.mp4" type="video/mp4" />
          </video>

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center h-full p-6 bg-black/30 backdrop-blur-sm">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2 text-white">Welcome Home</h1>
              <p className="text-base text-gray-100">Your sound lives here. Tune in and vibe with Lounge.</p>
              <StationSelect />
            </div>

            {/* ✅ only show LivePlayer when station is selected */}
            {selected && (
              <div className="w-full max-w-md mt-6 md:mt-0">
                <LivePlayer />
              </div>
            )}
          </div>
        </section>

        <section className="mb-20">
          <h2 className="text-2xl font-semibold mb-6">Weekly Schedule</h2>

          {/* ✅ only show WeeklyTabs when station is selected */}
          {selected && <WeeklyTabs />}
        </section>

        <div className="bg-[url('/bank-note.svg')] bg-cover" />
      </main>

      <Footer />
    </div>
  );
}
