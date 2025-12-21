// components/admin/ShowDialog.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useShowStore, ScheduleSlot } from "@/stores/useShowStore";
import ShowForm from "@/components/admin/ShowForm";

interface ShowDialogProps {
  station: { id: string; name: string };
  onSave: (slot: ScheduleSlot, isNew: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function ShowDialog({ station, onSave, onDelete }: ShowDialogProps) {
  const { isOpen, closeDialog, isEditMode } = useShowStore();

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent className="bg-background text-foreground max-w-xl w-[90vw] sm:w-[80vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Show" : "Create New Show"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the details of this show."
              : "Fill in the details to create a new show for the schedule."}
          </DialogDescription>
        </DialogHeader>
        <ShowForm station={station} onSave={onSave} onDelete={onDelete} />
      </DialogContent>
    </Dialog>
  );
}
