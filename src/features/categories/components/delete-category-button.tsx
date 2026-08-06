"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/modals";
import { deleteCategoryAction } from "../actions/category-actions";

interface Props {
  categoryId: string;
  categoryName: string;
}

export function DeleteCategoryButton({ categoryId, categoryName }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteCategoryAction(categoryId);
      if (!result.success) {
        toast.error(result.error || "Failed to delete.");
        return;
      }
      toast.success(result.message || "Deleted.");
      router.refresh();
    });
  };

  return (
    <>
      <Button variant="destructive" size="sm" onClick={() => setOpen(true)} disabled={isPending}>
        <Trash2 className="mr-1 h-3.5 w-3.5" />
        Delete
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete Category"
        description={`Delete "${categoryName}"? This cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </>
  );
}