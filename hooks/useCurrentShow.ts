"use client";
import { useEffect, useState } from "react";
import { getCurrentShow } from "@/lib/getCurrentShow";

export function useCurrentShow() {
  const [currentShow, setCurrentShow] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch("/api/schedule");
      const data = await res.json();
      setCurrentShow(getCurrentShow(data));
    }

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  return currentShow;
}
