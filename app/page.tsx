'use client';

import { useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LivePlayer from "@/components/radio/LivePlayer";
import WeeklyTabs from "@/components/schedule/WeeklyTabs";
import { useStationStore } from "@/stores/useStationStore";
import BlogByCategory from "@/components/blog/BlogByCategory";
import AudioVisualizer from "@/components/radio/AudioVisualizer";
import stations from "@/data/stations.json"; // assuming this file exists

export default function HomePage() {
  const { selected, setSelected } = useStationStore();

  // Select the first station as default if none is selected
  useEffect(() => {
    if (!selected && stations.length > 0) {
      setSelected(stations[0]); // fallback to first station
    }
  }, [selected]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-10">
        {/* Hero Section */}
        <section className="relative h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden rounded-2xl mb-12">
          {/* Semi-transparent overlay */}
          <div className="absolute inset-0 bg-muted/70 backdrop-blur-sm z-10" />

          {/* Audio waveform */}
          {selected && <AudioVisualizer />}

          {/* Overlay content */}
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center h-full p-6 bg-muted/40 backdrop-blur-sm rounded-2xl">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">Welcome Home</h1>
              <p className="text-base text-muted-foreground">
                Your sound lives here. Tune in and vibe with Lounge.
              </p>
            </div>

            {selected && (
              <div className="w-full max-w-md mt-6 md:mt-0">
                <LivePlayer />
              </div>
            )}
          </div>
        </section>

        {/* Schedule Section */}
        {selected && (
          <section className="mb-20">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
              <WeeklyTabs />
            </div>
          </section>
        )}

        <div className="bg-[url('/bank-note.svg')] bg-cover" />
        <BlogByCategory limit={4} />
      </main>

      <Footer />
    </div>
  );
}
