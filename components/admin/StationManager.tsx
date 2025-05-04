//components/admin/StationManager.tsx
// this view is how the admin manages station from the admin view 

"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useStationAdminStore } from "@/stores/useStationAdminStore";
import StationDialog from "./StationDialog";
import { Separator } from "@/components/ui/separator"

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h2 className="text-xl font-semibold">Manage Stations</h2>
        <Button
          onClick={() => openDialog()}
          className="w-full sm:w-auto text-center"
        >
          + Add Station
        </Button>
      </div>
      <Separator className="my-4" />

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 w-full overflow-hidden">
        
          {stations.map((station) => (
            <Card
            key={station.id}
            className="p-3 w-full rounded-lg shadow-sm hover:bg-muted transition-colors cursor-pointer "
            onClick={() => openDialog(station)}
          >
            <h3 className="font-semibold text-base leading-tight mb-1 break-words">
              {station.name}
            </h3>
            <p className="text-sm text-muted-foreground break-all whitespace-normal"> {station.streamUrl} </p>
          </Card>        
          ))}
      </div>

      <StationDialog onSaved={triggerRefresh} />
    </div>
  );
}
