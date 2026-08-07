"use client";

import { useState, useTransition } from "react";
import { RotateCcw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";
import { processRefundAction } from "../actions/sales-actions";

interface RefundButtonProps {
  orderId: string;
  orderTotal: number;
  existingRefunds: number;
}

export function RefundButton({
  orderId,
  orderTotal,
  existingRefunds,
}: RefundButtonProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const maxRefundable = orderTotal - existingRefunds;

  const handleRefund = () => {
    const refundAmount = parseFloat(amount);

    if (!refundAmount || refundAmount <= 0) {
      toast.error("Enter a valid amount.");
      return;
    }

    if (refundAmount > maxRefundable) {
      toast.error(`Max refundable: ${formatCurrency(maxRefundable)}`);
      return;
    }

    if (!reason.trim()) {
      toast.error("Please enter a reason for refund.");
      return;
    }

    startTransition(async () => {
      const result = await processRefundAction(
        orderId,
        refundAmount,
        reason.trim()
      );

      if (!result.success) {
        toast.error(result.error || "Refund failed.");
        return;
      }

      toast.success(result.message || "Refund processed.");
      setOpen(false);
      setAmount("");
      setReason("");
      router.refresh();
    });
  };

  if (maxRefundable <= 0) {
    return (
      <Button variant="outline" disabled className="text-xs">
        Fully Refunded
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="destructive"
        onClick={() => setOpen(true)}
        className="text-xs"
      >
        <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
        Refund
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-black">Process Refund</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-xl border p-4 bg-muted/30">
              <div className="flex justify-between text-sm">
                <span>Order Total</span>
                <span className="font-bold">
                  {formatCurrency(orderTotal)}
                </span>
              </div>
              {existingRefunds > 0 && (
                <div className="flex justify-between text-sm text-red-500 mt-1">
                  <span>Already Refunded</span>
                  <span className="font-bold">
                    -{formatCurrency(existingRefunds)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold mt-2 pt-2 border-t">
                <span>Max Refundable</span>
                <span>{formatCurrency(maxRefundable)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Refund Amount</Label>
              <Input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                max={maxRefundable}
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => setAmount(String(maxRefundable))}
                >
                  Full Refund
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() =>
                    setAmount(String((maxRefundable / 2).toFixed(2)))
                  }
                >
                  Half
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Reason</Label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Why is this refund being processed?"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleRefund}
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Confirm Refund"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}