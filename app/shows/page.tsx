// app/shows/page.tsx
'use client';

import { useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WeeklyTabs from "@/components/schedule/WeeklyTabs";
import { useStationStore } from "@/stores/useStationStore";
import stations from "@/data/stations.json";

export default function ShowsPage() {
  const { selected, setSelected } = useStationStore();

  // Mirrors the homepage's bootstrap: if a visitor lands here directly
  // (no station chosen yet this session), default to the first station
  // rather than showing an empty page.
  useEffect(() => {
    if (!selected && stations.length > 0) {
      setSelected(stations[0]);
    }
  }, [selected, setSelected]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-10">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Shows</h1>
          <p className="text-muted-foreground text-base max-w-2xl mx-auto">
            The full weekly lineup{selected ? ` for ${selected.name}` : ""}, pulled live from the schedule.
          </p>
        </header>

        {selected ? (
          <WeeklyTabs />
        ) : (
          <p className="text-center text-muted-foreground">Loading stations...</p>
        )}
      </main>
      <Footer />
    </div>
  );
}
