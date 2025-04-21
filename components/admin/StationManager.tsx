"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useStationAdminStore } from "@/stores/useStationAdminStore";
import StationDialog from "./StationDialog";

type Station = {
  id: string;
  name: string;
  streamUrl: string;
};

export default function StationManager() {
  const { openDialog, closeDialog } = useStationAdminStore();
  const [stations, setStations] = useState<Station[]>([]);
  const [refreshFlag, setRefreshFlag] = useState(false);

  const fetchStations = () => {
    fetch("/api/stations")
      .then((res) => res.json())
      .then(setStations);
  };

  useEffect(() => {
    fetchStations();
  }, [refreshFlag]);

  // Trigger this from StationForm after saving
  const triggerRefresh = () => {
    setRefreshFlag((prev) => !prev);
    closeDialog();
  };

  return (
    <div className="space-y-6 bg-background text-foreground p-4 rounded-lg">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Manage Stations</h2>
        <Button onClick={() => openDialog()}>+ Add Station</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {stations.map((station) => (
          <Card
            key={station.id}
            className="p-4 cursor-pointer hover:bg-muted"
            onClick={() => openDialog(station)}
          >
            <h3 className="font-semibold">{station.name}</h3>
            <p className="text-sm text-muted-foreground">{station.streamUrl}</p>
          </Card>
        ))}
      </div>

      <StationDialog onSaved={triggerRefresh} />
    </div>
  );
}
