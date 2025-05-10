// app/team/page.tsx – drop‑in replacement

'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
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

/** Types shared with the admin screen (consider extracting to a shared file) */
interface OAP {
  id: string;
  name: string;
  role: string;
  bio: string;
  photoUrl: string;
  showSlugs: string[]; // IDs of the shows this presenter hosts
}

interface Show {
  id: string;
  title: string;
  thumbnailUrl?: string;
}

export default function TeamPage() {
  const [oaps, setOaps] = useState<OAP[]>([]);
  const [shows, setShows] = useState<Show[]>([]);
  const [selectedOAP, setSelectedOAP] = useState<OAP | null>(null);

  /**
   * Fetch presenters and schedule in parallel.
   * If either request fails we log the error – you could surface a toast or skeleton here instead.
   */
  useEffect(() => {
    async function loadData() {
      try {
        const [oapRes, showRes] = await Promise.all([
          fetch('/api/oaps'),
          // NOTE: 🔑 switched to the plural route so we actually hit the endpoint
          fetch('/api/schedule?stationId=lounge877'),
        ]);

        if (!oapRes.ok || !showRes.ok) {
          throw new Error('One or more requests failed');
        }

        const [oapData, showData] = await Promise.all([
          oapRes.json(),
          showRes.json(),
        ]);

        setOaps(oapData);
        setShows(
          showData.map((s: any) => ({
            id: s.id,
            title: s.showTitle,
            thumbnailUrl: s.thumbnailUrl,
          })) as Show[],
        );
      } catch (err) {
        console.error('Failed to load team page data', err);
      }
    }

    loadData();
  }, []);

  const getShowsForOAP = (oap: OAP): Show[] =>
    oap.showSlugs
      .map((slug) => shows.find((s) => s.id === slug))
      .filter((s): s is Show => Boolean(s));

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Meet our presenters</h1>
          <p className="text-muted-foreground text-base max-w-2xl mx-auto">
            The voices and talents behind Lounge Network Lagos
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {oaps.map((oap) => (
            <Drawer key={oap.id}>
              <DrawerTrigger asChild>
                <div
                  onClick={() => setSelectedOAP(oap)}
                  className="flex flex-col items-center bg-muted/50 dark:bg-muted/40 rounded-xl p-6 text-center transition hover:scale-105 hover:shadow-md cursor-pointer"
                >
                  <div className="w-24 h-24 mb-4 overflow-hidden rounded-full bg-muted">
                    <img src={oap.photoUrl} alt={oap.name} className="object-cover w-full h-full" />
                  </div>
                  <h2 className="text-lg font-semibold">{oap.name}</h2>
                  <p className="text-sm text-muted-foreground">{oap.role}</p>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{oap.bio}</p>

                  {/* Social Links – placeholder*/}
                  <div className="mt-6 flex gap-6 text-gray-600 dark:text-gray-400">
                    <a
                      href="https://x.com"
                      target="_blank"
                      aria-label="X"
                      className="hover:text-foreground dark:hover:text-foreground"
                    >
                      <i className="ri-twitter-x-line text-2xl" />
                    </a>
                    <a
                      href="https://instagram.com"
                      target="_blank"
                      aria-label="Instagram"
                      className="hover:text-foreground dark:hover:text-foreground"
                    >
                      <i className="ri-instagram-line text-2xl" />
                    </a>
                    <a
                      href="https://youtube.com"
                      target="_blank"
                      aria-label="YouTube"
                      className="hover:text-foreground dark:hover:text-foreground"
                    >
                      <i className="ri-youtube-line text-2xl" />
                    </a>
                  </div>
                </div>
              </DrawerTrigger>

              <DrawerContent className="w-full h-1/2 rounded-t-xl p-6">
                <DrawerHeader className="text-center relative">
                  <DrawerClose asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-4 top-4 text-muted-foreground"
                    >
                      ✕
                    </Button>
                  </DrawerClose>

                  {selectedOAP && (
                    <>
                      <div className="flex flex-col items-center space-y-2 mt-4">
                        <div className="w-24 h-24 rounded-full overflow-hidden bg-muted">
                          <img
                            src={selectedOAP.photoUrl}
                            alt={selectedOAP.name}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <DrawerTitle className="text-2xl text-foreground">
                          {selectedOAP.name}
                        </DrawerTitle>
                        <DrawerDescription className="text-muted-foreground">
                          {selectedOAP.role}
                        </DrawerDescription>
                      </div>
                      <div className="mt-6 text-sm text-muted-foreground px-4">
                        {selectedOAP.bio}
                      </div>
                      <div className="mt-4 px-4">
                        <h3 className="text-primary font-semibold mb-2">Shows:</h3>
                        {getShowsForOAP(selectedOAP).length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {getShowsForOAP(selectedOAP).map((show) => (
                              <div
                                key={show.id}
                                className="flex items-center gap-4 rounded-md border p-2 bg-muted/30"
                              >
                                <div className="w-12 h-12 rounded-md overflow-hidden bg-muted">
                                  <img
                                    src={show.thumbnailUrl}
                                    alt={show.title}
                                    className="object-cover w-full h-full"
                                  />
                                </div>
                                <div className="text-sm font-medium text-foreground">
                                  {show.title}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">
                            No shows assigned yet.
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </DrawerHeader>
              </DrawerContent>
            </Drawer>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
