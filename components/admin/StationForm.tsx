"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useStationAdminStore } from "@/stores/useStationAdminStore";

type Props = {
  onSaved?: () => void;
};

export default function StationForm({ onSaved }: Props) {
  const { selectedStation, closeDialog } = useStationAdminStore();
  const [form, setForm] = useState({
    id: "",
    name: "",
    streamUrl: "",
  });

  useEffect(() => {
    if (selectedStation) {
      setForm(selectedStation);
    } else {
      setForm({ id: "", name: "", streamUrl: "" });
    }
  }, [selectedStation]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!form.name || !form.streamUrl) {
      alert("Please fill in all required fields.");
      return;
    }

    const id = form.id || form.name.toLowerCase().replace(/\s+/g, "");

    const res = await fetch("/api/stations/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, id }),
    });

    if (res.ok) {
      alert("Station saved");
      if (onSaved) onSaved();
    } else {
      alert("Failed to save station");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Name</Label>
        <Input
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
        />
      </div>

      <div>
        <Label>Stream URL</Label>
        <Input
          value={form.streamUrl}
          onChange={(e) => handleChange("streamUrl", e.target.value)}
        />
      </div>

      <Button onClick={handleSave}>Save Station</Button>
    </div>
  );
}
