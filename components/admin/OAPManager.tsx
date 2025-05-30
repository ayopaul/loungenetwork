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
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"

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
  const [uploadingImages, setUploadingImages] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [oapToDelete, setOapToDelete] = useState<{ oap: OAP; index: number } | null>(null);

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
    const newId = uuidv4();
    const newOAP: OAP = {
      id: `new-${newId}`,
      stationId: station.id,
      name: "",
      bio: "",
      shows: [],
      photoUrl: "",
    };
    setOaps(prev => [newOAP, ...prev]);
  };

  const handleDelete = async (index: number) => {
    const oap = oaps[index];
    
    // If it's a new OAP (not saved to database yet), just remove from state
    if (oap.id.startsWith("new-")) {
      setOaps(prev => prev.filter((_, i) => i !== index));
      toast.success("OAP removed");
      return;
    }
    
    // For existing OAPs, show confirmation dialog
    setOapToDelete({ oap, index });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!oapToDelete) return;
    
    const { oap, index } = oapToDelete;
    
    try {
      const res = await fetch(`/api/oaps/${oap.id}`, {
        method: "DELETE",
      });
      
      if (!res.ok) {
        let errorMessage = `HTTP ${res.status}: ${res.statusText}`;
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If JSON parsing fails, use the HTTP status
        }
        throw new Error(errorMessage);
      }
      
      // Remove from local state after successful deletion
      setOaps(prev => prev.filter((_, i) => i !== index));
      toast.success("OAP deleted successfully");
      
    } catch (err: any) {
      console.error("Delete failed:", err);
      const errorMessage = err.message || err.toString() || "Unknown error occurred";
      toast.error("Error deleting OAP: " + errorMessage);
    } finally {
      setDeleteDialogOpen(false);
      setOapToDelete(null);
    }
  };

  const handleImageUpload = async (index: number, file: File) => {
    const oap = oaps[index];
    const oapId = oap.id;
    
    // Add to uploading set
    setUploadingImages(prev => new Set(prev).add(oapId));
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      // Generate a clean filename - use timestamp to ensure uniqueness
      const cleanId = oapId.startsWith("new-") ? oapId.replace("new-", "") : oapId;
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop() || 'jpg';
      const filename = `${cleanId}-${timestamp}.${fileExtension}`;
      formData.append("filename", filename);
      
      console.log("Uploading with filename:", filename);
      
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Upload failed: ${errorText}`);
      }
      
      const { url } = await res.json();
      console.log("Upload successful, URL:", url);
      
      // Update the photoUrl immediately
      handleUpdate(index, "photoUrl", url);
      
      // Show success toast
      toast.success("Image uploaded successfully!");
      
      // Optionally auto-save after successful upload
      // You can uncomment this if you want automatic saving after image upload
      // setTimeout(() => handleSave(), 500);
      
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload failed: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      // Remove from uploading set
      setUploadingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(oapId);
        return newSet;
      });
    }
  };

  const handleSave = async (singleOap?: OAP) => {
    const oapsToSave = singleOap ? [singleOap] : oaps.map(o => ({ ...o, stationId: station.id }));
    try {
      const res = await fetch("/api/oaps/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stationId: station.id, oaps: oapsToSave }),
      });
      
      if (!res.ok) {
        let errorMessage = `HTTP ${res.status}: ${res.statusText}`;
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If JSON parsing fails, use the HTTP status
        }
        throw new Error(errorMessage);
      }
      
      const result = await res.json();
      toast.success(singleOap ? "OAP saved successfully!" : "All changes saved successfully!");
      
      // Refresh data to get updated IDs for new records
      await fetchOAPsAndShows();
      
    } catch (err: any) {
      console.error("Save failed:", err);
      const errorMessage = err.message || err.toString() || "Unknown error occurred";
      toast.error("Error saving changes: " + errorMessage);
    }
  };

  if (loading) return <p className="text-muted-foreground">Loading&nbsp;OAPs…</p>;

  return (
    <div className="space-y-6">
      <div className="flex justify-start items-center">
        <Button onClick={handleAdd} variant="outline">
          <PlusIcon className="w-4 h-4 mr-1" /> Add&nbsp;OAP
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
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleImageUpload(index, file);
                  }
                }}
              />
              {uploadingImages.has(oap.id) ? (
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-xs text-blue-600">
                  Uploading...
                </div>
              ) : oap.photoUrl ? (
                <img
                  src={oap.photoUrl}
                  alt={oap.name || "OAP photo"}
                  className="w-16 h-16 rounded-full object-cover"
                  onError={(e) => {
                    console.error("Image failed to load:", oap.photoUrl);
                    handleUpdate(index, "photoUrl", "");
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
            
            <Button 
              onClick={() => handleSave(oap)} 
              variant="default" 
              size="sm"
              className="w-full mt-2"
            >
              Save OAP
            </Button>
          </Card>
        ))}
      </div>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete OAP</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{oapToDelete?.oap.name || 'this OAP'}"? 
              This action cannot be undone and will permanently remove the OAP and associated photo.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setDeleteDialogOpen(false);
                setOapToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
            >
              Delete OAP
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}