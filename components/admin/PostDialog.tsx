// components/admin/PostDialog.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useBlogStore } from "../../stores/useBlogStore";
import PostForm from "@/components/admin/PostForm";

export default function PostDialog() {
  const { isOpen, closeDialog, isEditMode } = useBlogStore();

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent className="max-w-3xl bg-background text-foreground">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Blog Post" : "Create New Post"}
          </DialogTitle>
        </DialogHeader>
        <PostForm />
      </DialogContent>
    </Dialog>
  );
}
