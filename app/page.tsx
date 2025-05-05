// app/page.tsx
'use client';

import { AuroraBackground } from "@/components/ui/AuroraBackground"; 
import { motion } from "motion/react";
import { useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LivePlayer from "@/components/radio/LivePlayer";
import WeeklyTabs from "@/components/schedule/WeeklyTabs";
import { useStationStore } from "@/stores/useStationStore";
import BlogByCategory from "@/components/blog/BlogByCategory";
import stations from "@/data/stations.json";


export default function HomePage() {
  const { selected, setSelected } = useStationStore();

  useEffect(() => {
    if (!selected && stations.length > 0) {
      setSelected(stations[0]);
    }
  }, [selected]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-10">
      <section className="relative overflow-hidden rounded-2xl mb-6">
          <AuroraBackground className="h-[400px] md:h-[500px] lg:h-[600px] rounded-2xl">
            <motion.div
              initial={{ opacity: 0.0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.3,
                duration: 0.8,
                ease: "easeInOut",
              }}
              className="relative z-10 flex flex-col md:flex-row justify-between items-center h-full w-full max-w-7xl px-4 md:px-6 mx-auto pt-8 md:pt-0 gap-4 md:gap-0"

            >
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
            </motion.div>
          </AuroraBackground>
        </section>



        <section className="mb-20">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            {selected && <WeeklyTabs />}
          </div>
        </section>

        <div className="bg-[url('/bank-note.svg')] bg-cover" />
        <BlogByCategory limit={4} />
      </main>

      <Footer />
    </div>
  );
}
