// components/admin/PostDialog.tsx
// the is the modal that contatins the new blog post fields

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
      <DialogContent className="bg-background text-foreground max-w-3xl w-[90vw] sm:w-[80vw] max-h-[90vh] overflow-y-auto">
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
