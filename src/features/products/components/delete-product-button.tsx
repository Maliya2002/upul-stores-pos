"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/modals";
import { deleteProductAction } from "../actions/product-actions";

interface DeleteProductButtonProps {
  productId: string;
  productName: string;
  redirectTo?: string;
}

export function DeleteProductButton({
  productId,
  productName,
  redirectTo,
}: DeleteProductButtonProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteProductAction(productId);

      if (!result.success) {
        toast.error(result.error || "Failed to delete product.");
        return;
      }

      toast.success(result.message || "Product deleted successfully.");

      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.refresh();
      }
    });
  };

  return (
    <>
      <Button
        variant="destructive"
        onClick={() => setOpen(true)}
        disabled={isPending}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Delete
      </Button>

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete Product"
        description={`Are you sure you want to delete "${productName}"? This action cannot be undone.`}
        confirmText={isPending ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </>
  );
}