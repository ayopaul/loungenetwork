  // app/admin/team/page.tsx

'use client';
import { MultiSelectCombobox } from "@/components/shared/MultiSelectCombobox";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type OAP = {
  id: string;
  name: string;
  role: string;
  bio: string;
  photoUrl: string;
  showSlugs: string[];
};

const defaultOAP: OAP = {
  id: "",
  name: "",
  role: "",
  bio: "",
  photoUrl: "",
  showSlugs: [],
};

export default function AdminTeamPage() {
  const [oaps, setOaps] = useState<OAP[]>([]);
  const [selectedOAP, setSelectedOAP] = useState<OAP | null>(null);
  const [newOAP, setNewOAP] = useState<OAP | null>(null);
  const [allShows, setAllShows] = useState<{ id: string; title: string }[]>([]);

  useEffect(() => {
    async function fetchOAPs() {
      try {
        const res = await fetch("/api/oaps");
        const data = await res.json();
        setOaps(data);
      } catch (error) {
        console.error("Failed to fetch OAPs:", error);
      }
    }

    async function fetchShows() {
      try {
        const res = await fetch("/api/schedules?stationId=lounge877");
        const data = await res.json();
        const formatted = data.map((s: any) => ({ id: s.id, title: s.showTitle }));
        setAllShows(formatted);
      } catch (error) {
        console.error("Failed to fetch shows:", error);
      }
    }

    fetchOAPs();
    fetchShows();
  }, []);

  function handleInputChange(field: keyof OAP, value: string) {
    if (selectedOAP) {
      setSelectedOAP({ ...selectedOAP, [field]: value });
    }
  }

  async function saveOAPs(updated: OAP[]) {
    try {
      const res = await fetch("/api/oaps/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error("Failed to save OAPs");
      setOaps(updated);

      toast.success("Changes saved", {
        description: "The team member updates have been saved successfully!",
      });
    } catch (error) {
      console.error(error);
      toast.error("Save failed", {
        description: "There was a problem saving the changes.",
      });
    }
  }

  function saveEditedOAP() {
    if (!selectedOAP) return;
    const updated = oaps.map((oap) => (oap.id === selectedOAP.id ? selectedOAP : oap));
    saveOAPs(updated);
    setSelectedOAP(null);
  }

  function deleteOAP(id: string) {
    const updated = oaps.filter((oap) => oap.id !== id);
    saveOAPs(updated);
  }

  function addNewOAP() {
    if (!newOAP) return;
    const updated = [...oaps, { ...newOAP, id: Date.now().toString() }];
    saveOAPs(updated);
    setNewOAP(null);
  }

  return (
    <div className="p-10 space-y-10">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manage Team Members</h1>

        <Dialog>
          <DialogTrigger asChild>
            <Button>Add New OAP</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New OAP</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <Input placeholder="Name" onChange={(e) => setNewOAP({ ...(newOAP || defaultOAP), name: e.target.value })} />
              <Input placeholder="Role" onChange={(e) => setNewOAP({ ...(newOAP || defaultOAP), role: e.target.value })} />
              <Textarea placeholder="Bio" onChange={(e) => setNewOAP({ ...(newOAP || defaultOAP), bio: e.target.value })} />
              <Input placeholder="Photo URL" onChange={(e) => setNewOAP({ ...(newOAP || defaultOAP), photoUrl: e.target.value })} />
              <MultiSelectCombobox
                options={allShows.map((show) => ({ label: show.title, value: show.id }))}
                selectedValues={newOAP?.showSlugs || []}
                onChange={(values: string[]) =>
                  setNewOAP({ ...(newOAP || defaultOAP), showSlugs: values })
                }
              />
              <Button onClick={addNewOAP}>Save</Button>
            </div>

            <DialogClose asChild>
              <Button variant="outline" className="mt-4 w-full">
                Cancel
              </Button>
            </DialogClose>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {oaps.map((oap) => (
          <Drawer key={oap.id}>
            <DrawerTrigger asChild>
              <div
                onClick={() => setSelectedOAP(oap)}
                className="p-6 bg-muted/50 dark:bg-muted/30 rounded-xl cursor-pointer flex flex-col items-center text-center"
              >
                <div className="w-20 h-20 mb-4 overflow-hidden rounded-full bg-muted">
                  <img src={oap.photoUrl} alt={oap.name} className="object-cover w-full h-full" />
                </div>
                <h2 className="font-semibold">{oap.name}</h2>
                <p className="text-muted-foreground text-sm">{oap.role}</p>
              </div>
            </DrawerTrigger>

            <DrawerContent className="h-1/2 w-full rounded-t-xl p-6 overflow-y-auto">
              <DrawerHeader className="text-center relative">
                <DrawerClose asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-4 text-muted-foreground"
                  >
                    ✕
                  </Button>
                </DrawerClose>

                {selectedOAP && (
                  <div className="flex flex-col gap-4 mt-6">
                    <Label>Name</Label>
                    <Input value={selectedOAP.name} onChange={(e) => handleInputChange("name", e.target.value)} />
                    <Label>Role</Label>
                    <Input value={selectedOAP.role} onChange={(e) => handleInputChange("role", e.target.value)} />
                    <Label>Bio</Label>
                    <Textarea value={selectedOAP.bio} onChange={(e) => handleInputChange("bio", e.target.value)} />
                    <Label>Photo URL</Label>
                    <Input value={selectedOAP.photoUrl} onChange={(e) => handleInputChange("photoUrl", e.target.value)} />
                    <Label>Assign Shows</Label>
                    <MultiSelectCombobox
                      options={allShows.map((show) => ({ label: show.title, value: show.id }))}
                      selectedValues={selectedOAP.showSlugs}
                      onChange={(values: string[]) =>
                        setSelectedOAP({ ...selectedOAP, showSlugs: values })
                      }
                    />
                    <div className="flex gap-2 mt-4">
                      <Button onClick={saveEditedOAP}>Save Changes</Button>
                      <Button variant="destructive" onClick={() => deleteOAP(selectedOAP.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </DrawerHeader>
            </DrawerContent>
          </Drawer>
        ))}
      </div>
    </div>
  );
}
