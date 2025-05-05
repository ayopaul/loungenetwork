"use client";

import { useState } from "react";
import { useStationStore } from "@/stores/useStationStore";
import { useStations } from "@/hooks/useStations";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ChevronDown } from "lucide-react";

export function StationSelect() {
  const { selected, setSelected } = useStationStore();
  const { stations, loading, error } = useStations();
  const [open, setOpen] = useState(false);

  if (loading) {
    return <p className="text-xs text-muted-foreground">Loading stations...</p>;
  }

  if (error) {
    return <p className="text-xs text-red-500">{error}</p>;
  }

  return (
    <Select
      value={selected?.id}
      onValueChange={(value) => {
        const station = stations.find((s) => s.id === value);
        if (station) setSelected(station);
      }}
      open={open}
      onOpenChange={setOpen}
    >
      <SelectTrigger className="h-7 w-[200px] text-xs bg-background border border-border text-foreground rounded-md px-2 flex items-center justify-between">
            <div className="flex items-center gap-1 whitespace-nowrap">

            <span className="text-muted-foreground shrink-0">Station:</span>
            <SelectValue placeholder="Select a station" className="truncate" />
          </div>

       
          
      </SelectTrigger>



      <SelectContent>
        {stations.map((station) => (
          <SelectItem
            key={station.id}
            value={station.id}
            className={`text-xs ${station.id === selected?.id ? "bg-muted font-semibold" : ""}`}
          >
            {station.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
