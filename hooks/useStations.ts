"use client";

import { useEffect, useState } from "react";

export type Station = {
  id: string;
  name: string;
  streamUrl: string;
};

export function useStations() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const res = await fetch("/api/stations");
        if (!res.ok) throw new Error("Failed to fetch stations");
        const data: Station[] = await res.json();
        setStations(data);
      } catch (err) {
        console.error("useStations error:", err);
        setError("Could not load stations");
      } finally {
        setLoading(false);
      }
    };

    fetchStations();
  }, []);

  return { stations, loading, error };
}
