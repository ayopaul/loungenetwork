// components/admin/OAPManager.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MultiSelectCombobox } from "@/components/shared/MultiSelectCombobox";
import { Card } from "@/components/ui/card";
import { Station } from "@/types/types";
import { TrashIcon, PlusIcon } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

type OAP = {
  id: string;
  stationId: string;
  name: string;
  bio: string;
  shows: string[];
  photoUrl: string;
};

export default function OAPManager({ station }: { station: Station }) {
  const [oaps, setOaps] = useState<OAP[]>([]);
  const [shows, setShows] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOAPsAndShows = async () => {
    setLoading(true);
    try {
      const [oapRes, scheduleRes] = await Promise.all([
        fetch(`/api/oaps?stationId=${station.id}`),
        fetch(`/api/schedule?stationId=${station.id}`),
      ]);

      const [oapData, scheduleData] = await Promise.all([
        oapRes.json(),
        scheduleRes.ok ? scheduleRes.json() : Promise.resolve([]),
      ]);

      setOaps(oapData);
      const uniqueTitles = [...new Set(scheduleData.map((s: any) => s.showTitle))] as string[];
      setShows(uniqueTitles);
    } catch (err) {
      console.error("Data fetch failed:", err);
      setOaps([]);
      setShows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOAPsAndShows();
  }, [station.id]);

  const handleUpdate = (index: number, field: keyof OAP, value: any) => {
    setOaps(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAdd = () => {
    const newOAP: OAP = {
      id: `new-${uuidv4()}`, // Add "new-" prefix for new records
      stationId: station.id,
      name: "",
      bio: "",
      shows: [],
      photoUrl: "",
    };
    setOaps(prev => [newOAP, ...prev]);
  };

  const handleDelete = (index: number) => {
    setOaps(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const oapsWithStation = oaps.map(o => ({ ...o, stationId: station.id }));
    try {
      const res = await fetch("/api/oaps/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stationId: station.id, oaps: oapsWithStation }),
      });
      
      // Check if response is ok first
      if (!res.ok) {
        // Try to get error message from response
        let errorMessage = `HTTP ${res.status}: ${res.statusText}`;
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If JSON parsing fails, use the HTTP status
        }
        throw new Error(errorMessage);
      }
      
      // If successful, try to parse the response
      const result = await res.json();
      alert("Changes saved!");
      
    } catch (err: any) {
      console.error("Save failed:", err);
      const errorMessage = err.message || err.toString() || "Unknown error occurred";
      alert("Error saving changes: " + errorMessage);
    }
  };

  if (loading) return <p className="text-muted-foreground">Loading&nbsp;OAPs…</p>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button onClick={handleAdd} variant="outline">
          <PlusIcon className="w-4 h-4 mr-1" /> Add&nbsp;OAP
        </Button>
        <Button onClick={handleSave} variant="secondary">
          Save&nbsp;Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {oaps.map((oap, index) => (
          <Card key={oap.id} className="p-4 space-y-3 relative">
            <span className="absolute top-2 left-2 bg-muted text-xs px-2 py-0.5 rounded-md text-muted-foreground">
              {station.name}
            </span>
            <button
              onClick={() => handleDelete(index)}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700"
              title="Delete OAP"
            >
              <TrashIcon className="w-4 h-4" />
            </button>

     
              <label className="relative cursor-pointer w-16 h-16 rounded-full overflow-hidden border">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    
                    try {
                      const formData = new FormData();
                      formData.append("file", file);
                      
                      // Generate a clean filename without "new-" prefix
                      const cleanId = oap.id.startsWith("new-") ? oap.id.replace("new-", "") : oap.id;
                      const filename = `${cleanId}.jpg`;
                      formData.append("filename", filename);
                      
                      console.log("Uploading with filename:", filename);
                      
                      const res = await fetch("/api/upload", {
                        method: "POST",
                        body: formData,
                      });
                      
                      if (res.ok) {
                        const { url } = await res.json();
                        console.log("Uploaded URL:", url);
                        
                        // Verify the URL is accessible before updating state
                        const img = new Image();
                        img.onload = () => {
                          console.log("Image verified as accessible:", url);
                          handleUpdate(index, "photoUrl", url);
                        };
                        img.onerror = () => {
                          console.error("Uploaded image is not accessible:", url);
                          alert("Image uploaded but not accessible. Please try again.");
                        };
                        img.src = url;
                        
                      } else {
                        const errorText = await res.text();
                        console.error("Upload failed:", errorText);
                        alert("Upload failed: " + errorText);
                      }
                    } catch (error) {
                      console.error("Upload error:", error);
                      alert("Upload failed: " + error);
                    }
                  }}
                />
                {oap.photoUrl ? (
                  <img
                    src={oap.photoUrl}
                    alt={oap.name || "OAP photo"}
                    className="w-16 h-16 rounded-full object-cover"
                    onError={(e) => {
                      console.error("Image failed to load:", oap.photoUrl);
                      // Show the upload placeholder again if image fails
                      handleUpdate(index, "photoUrl", "");
                    }}
                    onLoad={() => {
                      console.log("Image loaded successfully:", oap.photoUrl);
                    }}
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-xs text-muted-foreground">
                    Upload image
                  </div>
                )}
              </label>
            <Input
              placeholder="Name"
              value={oap.name}
              onChange={(e) => handleUpdate(index, "name", e.target.value)}
            />
            <Input
              placeholder="Photo URL"
              value={oap.photoUrl}
              onChange={(e) => handleUpdate(index, "photoUrl", e.target.value)}
            />
            <Input
              placeholder="Bio"
              value={oap.bio}
              onChange={(e) => handleUpdate(index, "bio", e.target.value)}
            />
            {oap.shows.length > 0 && (
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
            <MultiSelectCombobox
              options={shows.map((title) => ({ label: title, value: title }))}
              selectedValues={oap.shows}
              onChange={(val) => handleUpdate(index, "shows", val)}
              placeholder="Select shows"
            />
          </Card>
        ))}
      </div>
    </div>
  );
}