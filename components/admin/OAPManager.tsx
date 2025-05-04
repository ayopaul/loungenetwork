// components/admin/OAPManager.tsx
"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MultiSelectCombobox } from "@/components/shared/MultiSelectCombobox";
import { Card } from "@/components/ui/card";
import { Station } from "@/types/types";
import { TrashIcon, PlusIcon } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

type OAP = {
  id: string;
  name: string;
  bio: string;
  shows: string[];
  photoUrl: string;
};

export default function OAPManager({ station }: { station: Station }) {
  const [oaps, setOaps] = useState<OAP[]>([]);
  const [shows, setShows] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res1 = await fetch(`/api/oaps`);
      const data1 = await res1.json();
      setOaps(data1);

      const res2 = await fetch(`/api/schedule?stationId=${station.id}`);
      if (!res2.ok) {
        console.error("Failed to load schedule:", res2.status);
        setShows([]);
        return;
      }

      const data2 = await res2.json();
      const uniqueShowTitles = [...new Set(data2.map((s: any) => s.showTitle))] as string[];
      setShows(uniqueShowTitles);

      setLoading(false);
    }

    load();
  }, [station.id]);

  function updateOAP(index: number, field: keyof OAP, value: any) {
    const updated = [...oaps];
    updated[index][field] = value;
    setOaps(updated);
  }

  function addOAP() {
    const newOAP: OAP = {
      id: uuidv4(),
      name: "",
      bio: "",
      shows: [],
      photoUrl: "",
    };
    setOaps([newOAP, ...oaps]);
  }

  function deleteOAP(index: number) {
    const updated = [...oaps];
    updated.splice(index, 1);
    setOaps(updated);
  }

  async function saveAll() {
    const res = await fetch("/api/oaps/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oaps }),
    });
  
    if (res.ok) {
        alert("Changes saved!");
      } else {
        const error = await res.json();
        console.error("Save failed:", error);
        alert("Error saving changes: " + error.error);
      }
  }
  

  if (loading) return <p className="text-muted-foreground">Loading OAPs...</p>;

  return (
    <div className="space-y-6">
      {/* Add OAP + Save Button */}
      <div className="flex justify-between items-center">
        <Button onClick={addOAP} variant="outline">
          <PlusIcon className="w-4 h-4 mr-1" />
          Add OAP
        </Button>
        <Button onClick={saveAll} variant="secondary" type="submit">Save Changes</Button>
      </div>

      {/* OAP Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {oaps.map((oap, index) => (
          <Card key={oap.id} className="p-4 space-y-3 relative">
            {/* Delete button */}
            <button
              onClick={() => deleteOAP(index)}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700"
              title="Delete OAP"
            >
              <TrashIcon className="w-4 h-4" />
            </button>

            {/* Photo */}
            {oap.photoUrl ? (
              <img
                src={
                  oap.photoUrl.startsWith("http")
                    ? oap.photoUrl
                    : `${oap.photoUrl}`
                }
                alt={oap.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-xs text-muted-foreground">
                No photo
              </div>
            )}

            {/* Inputs */}
            <Input
              placeholder="Name"
              value={oap.name}
              onChange={(e) => updateOAP(index, "name", e.target.value)}
            />
            <Input
              placeholder="Photo URL"
              value={oap.photoUrl}
              onChange={(e) => updateOAP(index, "photoUrl", e.target.value)}
            />
            <Input
              placeholder="Bio"
              value={oap.bio}
              onChange={(e) => updateOAP(index, "bio", e.target.value)}
            />

            {/* Show Badges */}
            {Array.isArray(oap.shows) && oap.shows.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {oap.shows.map((show) => (
                  <span
                    key={show}
                    className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-md"
                  >
                    {show}
                  </span>
                ))}
              </div>
            )}

            {/* Show Combobox */}
            <MultiSelectCombobox
              options={shows.map((title) => ({ label: title, value: title }))}
              selectedValues={oap.shows}
              onChange={(val) => updateOAP(index, "shows", val)}
              placeholder="Select shows"
            />
          </Card>
        ))}
      </div>
    </div>
  );
}
