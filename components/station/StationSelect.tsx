"use client";

import { useStationStore } from "@/stores/useStationStore";
import { useStations } from "@/hooks/useStations";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";

export function StationSelect() {
  const { selected, setSelected } = useStationStore();
  const { stations, loading, error } = useStations();

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
    >
      <SelectTrigger className="h-7 w-[145px] text-xs bg-transparent border-input shadow-sm">
        <span className="text-muted-foreground">Station:</span>
        <SelectValue placeholder="Select a station" />
      </SelectTrigger>
      <SelectContent>
        {stations.map((station) => (
          <SelectItem key={station.id} value={station.id} className="text-xs">
            {station.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
