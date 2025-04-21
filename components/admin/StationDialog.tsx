// components/admin/StationDialog.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import StationForm from "./StationForm";
import { useStationAdminStore } from "@/stores/useStationAdminStore";

export default function StationDialog({ onSaved }: { onSaved?: () => void }) {
  const { isOpen, closeDialog, isEditMode } = useStationAdminStore();

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent className="max-w-xl bg-background text-foreground">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Station" : "Add Station"}</DialogTitle>
        </DialogHeader>
        <StationForm onSaved={onSaved} />
      </DialogContent>
    </Dialog>
  );
}
