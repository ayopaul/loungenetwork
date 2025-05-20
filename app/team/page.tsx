'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useStationStore } from "@/stores/useStationStore";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
  DrawerClose,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';

/* ---------------- Types ---------------- */
interface OAP {
  id: string;
  name: string;
  role: string;
  bio: string;
  photoUrl: string;
  showSlugs?: string[];
  shows?: string[];
}

interface Show {
  id: string;
  title: string;
  thumbnailUrl?: string;
  startTime?: string;
  endTime?: string;
}

/* ---------------- Component ---------------- */
export default function TeamPage() {
  const { selected } = useStationStore(); // ✅ declare selected station
  const [oaps, setOaps] = useState<OAP[]>([]);
  const [shows, setShows] = useState<Show[]>([]);
  const [selectedOAP, setSelectedOAP] = useState<OAP | null>(null);

  useEffect(() => {
    if (!selected?.id) return;
  
    const stationId = selected.id; // ✅ narrowed type here
  
    async function loadData() {
      try {
        const [oapRes, scheduleRes] = await Promise.all([
          fetch(`/api/oaps?stationId=${stationId}`),
          fetch(`/api/schedule?stationId=${stationId}`), // ✅ now stationId is always a string
        ]);
  
        if (!oapRes.ok || !scheduleRes.ok) throw new Error('Failed to fetch');
  
        const [oapData, scheduleData] = await Promise.all([
          oapRes.json(),
          scheduleRes.json(),
        ]);
  
        setOaps(oapData as OAP[]);
        setShows(
          (scheduleData as any[]).map((s) => ({
            id: String(s.id),
            title: s.showTitle ?? s.title ?? s.name,
            thumbnailUrl: s.thumbnailUrl ?? s.imageUrl ?? s.coverArt,
            startTime: s.startTime ?? s.start ?? s.start_time,
            endTime: s.endTime ?? s.end ?? s.end_time,
          })) as Show[],
        );
      } catch (err) {
        console.error(err);
      }
    }
  
    loadData();
  }, [selected?.id]); // ✅ rerun when station changes

  const getShowsForOAP = (oap: OAP): Show[] =>
    (oap.showSlugs ?? [])
      .map((slug) => shows.find((s) => s.id === slug))
      .filter((s): s is Show => Boolean(s));

  const timeRange = (s?: string, e?: string) =>
    s && e ? `${s} – ${e}` : s ?? e ?? null;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-10">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Meet our presenters</h1>
          <p className="text-muted-foreground text-base max-w-2xl mx-auto">
            The voices and talents behind {selected?.name ?? 'Lounge Network'}
          </p>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {oaps.map((oap) => (
            <Drawer key={oap.id}>
              <DrawerTrigger asChild>
                <article
                  onClick={() => setSelectedOAP(oap)}
                  className="flex flex-col items-center bg-muted/50 dark:bg-muted/40 rounded-xl p-6 text-center cursor-pointer transition hover:scale-105 hover:shadow-md"
                >
                  <div className="w-24 h-24 mb-4 overflow-hidden rounded-full bg-muted">
                    <img src={oap.photoUrl} alt={oap.name} className="object-cover w-full h-full" />
                  </div>
                  <h2 className="text-lg font-semibold">{oap.name}</h2>
                  <p className="text-sm text-muted-foreground">{oap.role}</p>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{oap.bio}</p>
                </article>
              </DrawerTrigger>

              <DrawerContent className="w-full h-[70vh] sm:h-1/2 overflow-y-auto rounded-t-xl p-6">
                <DrawerHeader className="text-center relative">
                  <DrawerClose asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-4 top-4 text-muted-foreground"
                      aria-label="Close presenter details"
                    >
                      ✕
                    </Button>
                  </DrawerClose>

                  {selectedOAP && (
                    <>
                      <div className="flex flex-col items-center space-y-2 mt-4">
                        <div className="w-24 h-24 rounded-full overflow-hidden bg-muted">
                          <img src={selectedOAP.photoUrl} alt={selectedOAP.name} className="object-cover w-full h-full" />
                        </div>
                        <DrawerTitle className="text-2xl">{selectedOAP.name}</DrawerTitle>
                        <DrawerDescription>{selectedOAP.role}</DrawerDescription>
                      </div>

                      <p className="mt-6 text-sm text-muted-foreground px-4 whitespace-pre-line">
                        {selectedOAP.bio}
                      </p>

                      <div className="mt-6 px-4">
                        <h3 className="text-primary font-semibold mb-2">Shows:</h3>
                        {(() => {
                          const mapped = getShowsForOAP(selectedOAP);
                          if (mapped.length) {
                            return (
                              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {mapped.map((show) => (
                                  <li key={show.id} className="flex items-center gap-4 rounded-md border p-2 bg-muted/30">
                                    <div className="w-14 h-14 rounded-md overflow-hidden bg-muted shrink-0">
                                      {show.thumbnailUrl ? (
                                        <img src={show.thumbnailUrl} alt={show.title} className="object-cover w-full h-full" />
                                      ) : (
                                        <span className="flex items-center justify-center w-full h-full text-xs font-semibold text-muted-foreground">No image</span>
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-sm font-medium leading-tight">{show.title}</p>
                                      {timeRange(show.startTime, show.endTime) && (
                                        <p className="text-xs text-muted-foreground mt-0.5">{timeRange(show.startTime, show.endTime)}</p>
                                      )}
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            );
                          }
                          if (selectedOAP.shows?.length) {
                            return (
                              <div className="flex flex-wrap gap-2">
                                {selectedOAP.shows.map((title) => (
                                  <span key={title} className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-md">{title}</span>
                                ))}
                              </div>
                            );
                          }
                          return <p className="text-sm text-muted-foreground italic">No shows assigned yet.</p>;
                        })()}
                      </div>
                    </>
                  )}
                </DrawerHeader>
              </DrawerContent>
            </Drawer>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
}
