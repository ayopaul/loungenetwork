//components/admin/ScheduleEditor.tsx
"use client";

import { useEffect, useState, useRef, ChangeEvent } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type ScheduleSlot = {
  id: string;
  showTitle: string;
  startTime: string;
  endTime: string;
  description: string;
  thumbnailUrl: string;
  weekday: number;
  slug?: string;
};

const weekdays = [
  { label: "Sunday", value: "0" },
  { label: "Monday", value: "1" },
  { label: "Tuesday", value: "2" },
  { label: "Wednesday", value: "3" },
  { label: "Thursday", value: "4" },
  { label: "Friday", value: "5" },
  { label: "Saturday", value: "6" },
];

interface ScheduleEditorProps {
  station: { id: string; name: string };
}

// Placeholder for your actual image upload API endpoint
const IMAGE_UPLOAD_API_ENDPOINT = "/api/upload/thumbnail"; // Replace with your actual endpoint

export default function ScheduleEditor({ station }: ScheduleEditorProps) {
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState("0");
  const [uploadingThumbnailSlotId, setUploadingThumbnailSlotId] = useState<string | null>(null);
  // This ref will hold a map of slot IDs to their corresponding HTMLInputElement for file uploads.
  const thumbnailInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const clearErrorStyles = (el: HTMLElement) => {
    el.classList.remove("border-red-500", "ring-2", "ring-red-400");
  };

  // Effect to fetch schedule data when the station ID changes.
  useEffect(() => {
    if (!station?.id) return;
    setLoading(true);
    fetch(`/api/schedule?stationId=${station.id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch schedule: ${res.statusText}`);
        }
        return res.json();
      })
      .then((data: ScheduleSlot[]) => {
        // Ensure that the data received is an array before setting the schedule.
        setSchedule(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error("Fetch schedule error:", err);
        toast.error("Could not load schedule. Please try again.");
        setSchedule([]); // Reset schedule on error to avoid rendering issues.
      })
      .finally(() => setLoading(false));
  }, [station]); // Dependency array ensures this runs when station changes.

  // Effect to scroll the active tab into view when activeDay changes.
  useEffect(() => {
    // Query for the button element that has the data-state="active" attribute.
    const activeTab = document.querySelector(`button[data-state="active"]`);
    if (activeTab) {
      activeTab.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [activeDay]); // Dependency array ensures this runs when activeDay changes.

  // Function to update a specific field of a schedule slot.
  const updateSlot = (id: string, field: keyof ScheduleSlot, value: string | number) => {
    setSchedule((prev) =>
      prev.map((slot) =>
        slot.id === id ? { ...slot, [field]: value } : slot
      )
    );
  };

  // Function to add a new, empty schedule slot to the current active day.
  const handleAddSlot = () => {
    const newSlot: ScheduleSlot = {
      id: `new-${Date.now()}`, // Temporary unique ID for new slots.
      showTitle: "",
      startTime: "12:00", // Default start time.
      endTime: "12:30",   // Default end time.
      description: "",
      thumbnailUrl: "", // Initially no thumbnail.
      weekday: Number(activeDay), // Assign to the currently active day.
    };
    setSchedule((prev) => [...prev, newSlot]);
  };

  // Function to save a schedule slot (either new or existing) to the backend.
  const handleSaveSlot = async (slot: ScheduleSlot) => {
    // Helper function to generate a URL-friendly slug from text.
    function slugify(text: string): string {
      return text
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")        // Replace spaces with hyphens.
        .replace(/[^\w-]+/g, "")     // Remove all non-word characters except hyphens.
        .replace(/--+/g, "-");       // Replace multiple hyphens with a single hyphen.
    }

    // Basic client-side validation for required fields.
    if (!slot.showTitle.trim()) {
        toast.error("Show Title is required.");
        return; // Prevent saving if validation fails.
    }
    if (!slot.startTime) {
        toast.error("Start Time is required.");
        return;
    }
    if (!slot.endTime) {
        toast.error("End Time is required.");
        return;
    }
    // Ensure end time is after start time.
    if (slot.startTime >= slot.endTime) {
        toast.error("End Time must be after Start Time.");
        return;
    }

    // Prepare the slot data for saving, ensuring safe defaults.
    const safeTitle = slot.showTitle?.trim() || "Untitled Show";
    const safeStartTime = slot.startTime?.trim() || "00:00";
    const safeSlug = `${slugify(safeTitle)}-${safeStartTime.replace(":", "")}`;

    const safeSlot = {
      ...slot,
      showTitle: safeTitle,
      startTime: safeStartTime,
      endTime: slot.endTime?.trim() || "00:30", // Default duration 30 mins if not set.
      thumbnailUrl: slot.thumbnailUrl?.trim() || "/placeholder-image.svg", // Default placeholder.
      description: slot.description?.trim() || "No description available.",
      slug: safeSlug,
      stationId: station?.id, // Include station ID for backend context.
    };

    try {
      // API call to save the schedule slot.
      const res = await fetch("/api/schedule/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stationId: station?.id, schedule: [safeSlot] }), // API expects an array.
      });

      if (!res.ok) {
        // Try to parse error message from backend, otherwise use a generic one.
        const errorData = await res.json().catch(() => ({ message: "Save failed with no specific error." }));
        throw new Error(errorData.message || "Save failed");
      }
      
      const savedData = await res.json(); // Response from the server after saving.
      toast.success("Show saved successfully.");
      
      // Update local state with data from server.
      // This is important if the server assigns a new ID (for new slots) or modifies data.
      setSchedule(prev => prev.map(s => {
        if (s.id === slot.id && savedData.schedule && savedData.schedule.length > 0) {
            const serverSlot = savedData.schedule[0];
            // If the original slot ID was a temporary "new-" ID, update it to the server-generated ID.
            if (slot.id.startsWith("new-") && serverSlot.id) {
                // Update refs for thumbnail input if ID changes.
                if (thumbnailInputRefs.current[slot.id]) {
                    thumbnailInputRefs.current[serverSlot.id] = thumbnailInputRefs.current[slot.id];
                    delete thumbnailInputRefs.current[slot.id]; // Clean up old ref key.
                }
                return { ...s, ...serverSlot }; // Merge, ensuring new ID is used.
            }
            return { ...s, ...serverSlot }; // Merge with existing slot.
        }
        return s;
      }));

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Something went wrong while saving.";
      console.error("Save error:", err);
      toast.error(errorMessage);
    }
  };

  // Function to delete a schedule slot.
  const handleDeleteSlot = async (id: string) => {
    // If it's a new slot not yet saved to the backend, just remove from UI.
    if (id.startsWith("new-")) {
      setSchedule((prev) => prev.filter((slot) => slot.id !== id));
      // Clean up the ref for the deleted new slot.
      if (thumbnailInputRefs.current[id]) {
          delete thumbnailInputRefs.current[id];
      }
      toast.info("Show removed from editor.");
      return;
    }

    // For existing slots, optimistically remove from UI then call API.
    const originalSchedule = [...schedule]; // Keep a copy to revert on failure.
    setSchedule((prev) => prev.filter((slot) => slot.id !== id));

    try {
      // API call to delete the schedule slot.
      const res = await fetch(`/api/schedule/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stationId: station?.id, scheduleSlotId: id }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Delete failed with no specific error." }));
        throw new Error(errorData.message || "Delete failed on server.");
      }
      // Clean up the ref for the deleted slot.
      if (thumbnailInputRefs.current[id]) {
          delete thumbnailInputRefs.current[id];
      }
      toast.success("Show deleted successfully.");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Something went wrong while deleting.";
      console.error('Delete error:', err);
      toast.error(errorMessage);
      setSchedule(originalSchedule); // Revert UI change if delete failed.
    }
  };

  // Memoized time options for select dropdowns to prevent regeneration on every render.
  const timeOptions = generateTimeOptions();
  function generateTimeOptions(): { value: string; label: string }[] {
    const options: { value: string; label: string }[] = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) { // 30-minute intervals.
        const hour = h.toString().padStart(2, "0");
        const minute = m.toString().padStart(2, "0");
        const timeValue = `${hour}:${minute}`;
        options.push({ value: timeValue, label: timeValue });
      }
    }
    return options;
  }

  // Handles the change event when a new thumbnail file is selected.
  const handleThumbnailFileChange = async (event: ChangeEvent<HTMLInputElement>, slotId: string) => {
    const file = event.target.files?.[0]; // Get the selected file.
    if (!file) return; // No file selected.

    // Basic client-side file type validation.
    if (!file.type.startsWith("image/")) {
        toast.error("Invalid file type. Please select an image.");
        return;
    }
    // Basic client-side file size validation (e.g., 5MB limit).
    const MAX_SIZE_MB = 5;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        toast.error(`File is too large. Maximum size is ${MAX_SIZE_MB}MB.`);
        return;
    }

    setUploadingThumbnailSlotId(slotId); // Set loading state for this specific slot.
    toast.info("Uploading thumbnail...");

    const formData = new FormData(); // Use FormData for file uploads.
    formData.append("thumbnail", file);
    formData.append("stationId", station.id); // Add stationId if your API needs it.
    // formData.append("slotId", slotId); // Optionally add slotId if API requires it.

    try {
      // --- ACTUAL UPLOAD LOGIC ---
      // This fetch call sends the image to your backend API endpoint.
      const response = await fetch(IMAGE_UPLOAD_API_ENDPOINT, {
        method: "POST",
        body: formData,
        // Headers might be needed depending on your API (e.g., for authentication).
        // headers: { 'Authorization': `Bearer ${your_auth_token}` }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Upload failed with no specific error message from server." }));
        throw new Error(errorData.message || `Image upload failed: ${response.statusText}`);
      }

      const result = await response.json(); // Expecting { thumbnailUrl: "..." } from API.
      
      if (!result.thumbnailUrl) {
        throw new Error("Image URL not found in API response.");
      }

      updateSlot(slotId, "thumbnailUrl", result.thumbnailUrl); // Update slot with new URL from server.
      toast.success("Thumbnail uploaded successfully!");

    } catch (error) {
      console.error("Thumbnail upload error:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during upload.";
      toast.error(`Upload failed: ${errorMessage}`);
      // Optionally, revert to previous thumbnail or clear it if upload fails.
      // updateSlot(slotId, "thumbnailUrl", schedule.find(s => s.id === slotId)?.thumbnailUrl || ""); 
    } finally {
      setUploadingThumbnailSlotId(null); // Clear loading state.
      // Clear the file input value so the same file can be selected again if needed.
      if (thumbnailInputRefs.current[slotId]) {
        thumbnailInputRefs.current[slotId]!.value = "";
      }
    }
  };

  // Conditional rendering based on station selection and loading state.
  if (!station?.id) return <p className="text-center text-muted-foreground py-10">Select a station to begin editing its schedule.</p>;
  if (loading) return <p className="text-center text-muted-foreground py-10">Loading schedule...</p>;

  return (
    <main className="p-4 md:p-6 max-w-7xl mx-auto bg-background text-foreground rounded-lg shadow-md">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-primary">Schedule Editor</h1>
        <p className="text-muted-foreground">
          Currently editing: <span className="font-semibold">{station.name}</span>
        </p>
      </header>

      <Tabs value={activeDay} onValueChange={setActiveDay} className="w-full">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-4 md:grid-cols-7 mb-4">
          {weekdays.map((day) => (
            <TabsTrigger key={day.value} value={day.value} className="text-xs sm:text-sm">
              {day.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {weekdays.map((day) => (
          <TabsContent key={day.value} value={day.value}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Shows for {day.label}</h2>
              <Button onClick={handleAddSlot} variant="outline">
                Add New Show
              </Button>
            </div>
            <div className="space-y-6">
              {schedule
                .filter((slot) => slot.weekday === Number(day.value)) // Filter shows for the current day.
                .sort((a, b) => (a.startTime || "00:00").localeCompare(b.startTime || "00:00")) // Sort by start time.
                .map((slot) => (
                  <div key={slot.id} className="border p-4 rounded-lg shadow bg-card">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                      {/* Show Title Input */}
                      <div className="md:col-span-1">
                        <Label htmlFor={`showTitle-${slot.id}`} className="mb-1 block font-medium">Show Title</Label>
                        <Input
                          id={`showTitle-${slot.id}`}
                          value={slot.showTitle}
                          onChange={(e) => updateSlot(slot.id, "showTitle", e.target.value)}
                          placeholder="e.g., Morning Jazz"
                          className="w-full"
                        />
                      </div>

                      {/* Thumbnail Upload Section */}
                      <div className="md:row-start-1 md:col-start-2 md:row-span-2">
                        <Label htmlFor={`thumbnail-upload-${slot.id}`} className="mb-1 block font-medium">Show Thumbnail</Label>
                        <div className="mt-1 flex flex-col items-start gap-2">
                           <img
                            src={slot.thumbnailUrl || "/placeholder-image.svg"} // Display current or placeholder thumbnail.
                            alt="Thumbnail preview"
                            className="w-32 h-32 object-cover rounded border bg-muted"
                            // Fallback if the image fails to load.
                            onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-image.svg"; }}
                          />
                          {/* Hidden file input, triggered by the button */}
                          <input
                            type="file"
                            accept="image/*" // Accept only image files.
                            id={`thumbnail-input-${slot.id}`}
                            // Corrected ref assignment:
                            ref={(el) => { thumbnailInputRefs.current[slot.id] = el; }}
                            style={{ display: "none" }} // Hide the default file input UI.
                            onChange={(event) => handleThumbnailFileChange(event, slot.id)}
                          />
                          <Button
                            type="button" // Important: type="button" to prevent form submission if inside a form.
                            variant="outline"
                            size="sm"
                            onClick={() => thumbnailInputRefs.current[slot.id]?.click()} // Programmatically click the hidden input.
                            disabled={uploadingThumbnailSlotId === slot.id} // Disable while uploading.
                          >
                            {uploadingThumbnailSlotId === slot.id ? "Uploading..." : "Change Image"}
                          </Button>
                        </div>
                         {uploadingThumbnailSlotId === slot.id && <p className="text-xs text-muted-foreground mt-1">Processing image...</p>}
                      </div>
                      
                      {/* Start Time and End Time Selectors */}
                      <div className="md:col-span-1 grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`startTime-${slot.id}`} className="mb-1 block font-medium">Start Time</Label>
                          <Select
                            value={slot.startTime}
                            onValueChange={(value) => updateSlot(slot.id, "startTime", value)}
                          >
                            <SelectTrigger id={`startTime-${slot.id}`}>
                              <SelectValue placeholder="Start" />
                            </SelectTrigger>
                            <SelectContent>
                              {timeOptions.map(opt => (
                                <SelectItem key={`start-${opt.value}`} value={opt.value}>{opt.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor={`endTime-${slot.id}`} className="mb-1 block font-medium">End Time</Label>
                           <Select
                            value={slot.endTime}
                            onValueChange={(value) => updateSlot(slot.id, "endTime", value)}
                          >
                            <SelectTrigger id={`endTime-${slot.id}`}>
                              <SelectValue placeholder="End" />
                            </SelectTrigger>
                            <SelectContent>
                              {timeOptions.map(opt => (
                                <SelectItem key={`end-${opt.value}`} value={opt.value}>{opt.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Description Textarea */}
                      <div className="md:col-span-2">
                        <Label htmlFor={`description-${slot.id}`} className="mb-1 block font-medium">Description</Label>
                        <Textarea
                          id={`description-${slot.id}`}
                          value={slot.description}
                          onChange={(e) => updateSlot(slot.id, "description", e.target.value)}
                          placeholder="Enter a brief description of the show..."
                          className="w-full min-h-[80px]"
                        />
                      </div>
                    </div>
                    
                    {/* Action Buttons: Delete and Save */}
                    <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                      <Button variant="outline" size="sm" onClick={() => handleDeleteSlot(slot.id)}>
                        Delete
                      </Button>
                      <Button size="sm" onClick={() => handleSaveSlot(slot)}>
                        Save Show
                      </Button>
                    </div>
                  </div>
                ))}
                {/* Message displayed if no shows are scheduled for the current day. */}
                 {schedule.filter((slot) => slot.weekday === Number(day.value)).length === 0 && (
                    <p className="text-muted-foreground text-center py-4">No shows scheduled for {day.label}.</p>
                )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </main>
  );
}
