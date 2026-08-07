"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/modals";
import { deleteCustomerAction } from "../actions/customer-actions";

interface Props {
  customerId: string;
  customerName: string;
  redirectTo?: string;
}

export function DeleteCustomerButton({
  customerId,
  customerName,
  redirectTo,
}: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteCustomerAction(customerId);
      if (!result.success) {
        toast.error(result.error || "Failed to delete.");
        return;
      }
      toast.success(result.message || "Deleted.");
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
        size="sm"
        onClick={() => setOpen(true)}
        disabled={isPending}
      >
        <Trash2 className="mr-1 h-3.5 w-3.5" />
        Delete
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete Customer"
        description={`Delete "${customerName}"? This cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </>
  );
}