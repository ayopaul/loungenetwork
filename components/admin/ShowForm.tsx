// components/admin/ShowForm.tsx
"use client";

import { useState, useEffect, useRef, ChangeEvent } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useShowStore, ScheduleSlot } from "@/stores/useShowStore";

const weekdays = [
  { label: "Sunday", value: 0 },
  { label: "Monday", value: 1 },
  { label: "Tuesday", value: 2 },
  { label: "Wednesday", value: 3 },
  { label: "Thursday", value: 4 },
  { label: "Friday", value: 5 },
  { label: "Saturday", value: 6 },
];

interface ShowFormProps {
  station: { id: string; name: string };
  onSave: (slot: ScheduleSlot, isNew: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function ShowForm({ station, onSave, onDelete }: ShowFormProps) {
  const { isEditMode, selectedShow, closeDialog, activeDay } = useShowStore();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<ScheduleSlot>({
    id: "",
    showTitle: "",
    startTime: "12:00",
    endTime: "12:30",
    description: "",
    thumbnailUrl: "",
    weekday: activeDay,
  });

  useEffect(() => {
    if (isEditMode && selectedShow) {
      setForm({
        id: selectedShow.id,
        showTitle: selectedShow.showTitle || "",
        startTime: selectedShow.startTime || "12:00",
        endTime: selectedShow.endTime || "12:30",
        description: selectedShow.description || "",
        thumbnailUrl: selectedShow.thumbnailUrl || "",
        weekday: selectedShow.weekday,
        slug: selectedShow.slug,
      });
    } else {
      // New show
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substr(2, 5);
      setForm({
        id: `new-${timestamp}-${randomSuffix}`,
        showTitle: "",
        startTime: "12:00",
        endTime: "12:30",
        description: "",
        thumbnailUrl: "",
        weekday: activeDay,
      });
    }
  }, [isEditMode, selectedShow, activeDay]);

  const handleChange = (field: keyof ScheduleSlot, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const generateTimeOptions = (): { value: string; label: string }[] => {
    const options: { value: string; label: string }[] = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) {
        const hour = h.toString().padStart(2, "0");
        const minute = m.toString().padStart(2, "0");
        const timeValue = `${hour}:${minute}`;
        options.push({ value: timeValue, label: timeValue });
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  const handleThumbnailChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Invalid file type. Please select an image.");
      return;
    }

    const MAX_SIZE_MB = 5;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`File is too large. Maximum size is ${MAX_SIZE_MB}MB.`);
      return;
    }

    setUploadingThumbnail(true);
    toast.info("Uploading thumbnail...");

    const formData = new FormData();
    formData.append("thumbnail", file);
    formData.append("stationId", station.id);

    try {
      const response = await fetch("/api/upload/thumbnail", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      if (!result.thumbnailUrl) {
        throw new Error("Image URL not found in response.");
      }

      handleChange("thumbnailUrl", result.thumbnailUrl);
      toast.success("Thumbnail uploaded successfully!");
    } catch (error) {
      console.error("Thumbnail upload error:", error);
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploadingThumbnail(false);
      if (thumbnailInputRef.current) {
        thumbnailInputRef.current.value = "";
      }
    }
  };

  const handleSave = async () => {
    if (!form.showTitle.trim()) {
      toast.error("Show Title is required.");
      return;
    }
    if (!form.startTime) {
      toast.error("Start Time is required.");
      return;
    }
    if (!form.endTime) {
      toast.error("End Time is required.");
      return;
    }
    if (form.startTime >= form.endTime) {
      toast.error("End Time must be after Start Time.");
      return;
    }

    setSaving(true);
    try {
      await onSave(form, !isEditMode);
      closeDialog();
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this show? This cannot be undone.")) {
      return;
    }

    setDeleting(true);
    try {
      await onDelete(form.id);
      closeDialog();
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 bg-background text-foreground p-4">
      {/* Show Title */}
      <div>
        <Label htmlFor="showTitle">Show Title</Label>
        <Input
          id="showTitle"
          value={form.showTitle}
          onChange={(e) => handleChange("showTitle", e.target.value)}
          placeholder="e.g., Morning Jazz"
          className="mt-1"
        />
      </div>

      {/* Weekday */}
      <div>
        <Label htmlFor="weekday">Day of Week</Label>
        <Select
          value={form.weekday.toString()}
          onValueChange={(value) => handleChange("weekday", parseInt(value))}
        >
          <SelectTrigger id="weekday" className="mt-1">
            <SelectValue placeholder="Select day" />
          </SelectTrigger>
          <SelectContent>
            {weekdays.map((day) => (
              <SelectItem key={day.value} value={day.value.toString()}>
                {day.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Time Selection */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startTime">Start Time</Label>
          <Select
            value={form.startTime}
            onValueChange={(value) => handleChange("startTime", value)}
          >
            <SelectTrigger id="startTime" className="mt-1">
              <SelectValue placeholder="Start" />
            </SelectTrigger>
            <SelectContent>
              {timeOptions.map((opt) => (
                <SelectItem key={`start-${opt.value}`} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="endTime">End Time</Label>
          <Select
            value={form.endTime}
            onValueChange={(value) => handleChange("endTime", value)}
          >
            <SelectTrigger id="endTime" className="mt-1">
              <SelectValue placeholder="End" />
            </SelectTrigger>
            <SelectContent>
              {timeOptions.map((opt) => (
                <SelectItem key={`end-${opt.value}`} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Enter a brief description of the show..."
          className="mt-1 min-h-[100px]"
        />
      </div>

      {/* Thumbnail */}
      <div>
        <Label>Show Thumbnail</Label>
        <div className="mt-2 flex flex-col sm:flex-row items-start gap-4">
          <div className="relative w-32 h-32 rounded border bg-muted overflow-hidden">
            <Image
              src={form.thumbnailUrl || "/placeholder-image.svg"}
              alt="Thumbnail preview"
              fill
              sizes="128px"
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="flex flex-col gap-2">
            <input
              type="file"
              accept="image/*"
              ref={thumbnailInputRef}
              style={{ display: "none" }}
              onChange={handleThumbnailChange}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => thumbnailInputRef.current?.click()}
              disabled={uploadingThumbnail}
            >
              {uploadingThumbnail ? "Uploading..." : "Change Image"}
            </Button>
            {form.thumbnailUrl && (
              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                {form.thumbnailUrl.split("/").pop()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-6 border-t">
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={saving || deleting}>
            {saving ? "Saving..." : isEditMode ? "Update Show" : "Create Show"}
          </Button>
          <Button variant="outline" onClick={closeDialog} disabled={saving || deleting}>
            Cancel
          </Button>
        </div>

        {isEditMode && !form.id.startsWith("new-") && (
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={saving || deleting}
          >
            {deleting ? "Deleting..." : "Delete Show"}
          </Button>
        )}
      </div>
    </div>
  );
}
