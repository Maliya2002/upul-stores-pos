"use client";

import { useRef, useState, useTransition } from "react";
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
import {
  quoteReturn,
  type ReturnLine,
  type RefundRequest,
} from "../utils/returns";
import { useAuth } from "@/hooks/use-auth";
import { usePendingRequest } from "@/hooks/use-pending-request";

interface RefundButtonProps {
  orderId: string;
  orderTotal: number;
  existingRefunds: number;
  items: ReturnLine[];
  hasLegacyRefund: boolean;
  orderStatus: string;
}

export function RefundButton({
  orderId,
  orderTotal,
  existingRefunds,
  items,
  hasLegacyRefund,
  orderStatus,
}: RefundButtonProps) {
  const [open, setOpen] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [restock, setRestock] = useState<Record<string, boolean>>({});
  const [reason, setReason] = useState("");
  const [method, setMethod] = useState<RefundRequest["method"]>("CASH");
  const [isPending, startTransition] = useTransition();
  const busy = useRef(false);
  const router = useRouter();
  const { isManager, user } = useAuth();
  const recovery = usePendingRequest<RefundRequest>(
    user?.id ? `pos-pending-return:${user.id}:${orderId}` : null,
  );
  const saved = recovery.pending;
  const locked = isPending || !!saved;
  const selected =
    saved?.items ??
    items
      .filter((item) => quantities[item.id] > 0)
      .map((item) => ({
        orderItemId: item.id,
        quantity: quantities[item.id],
        restock: restock[item.id] ?? false,
      }));
  let amount = 0;
  let quoteError = "";
  try {
    if (selected.length)
      amount = quoteReturn(items, orderTotal, selected).reduce(
        (sum, line) => sum + line.amount,
        0,
      );
  } catch (error) {
    quoteError = error instanceof Error ? error.message : "Invalid return";
  }
  if (!isManager) return null;

  const handleRefund = () => {
    if (busy.current || !recovery.ready) return;
    if (!saved && (!selected.length || quoteError || !reason.trim())) {
      toast.error(quoteError || "Select items and enter a reason.");
      return;
    }
    const request = saved ?? {
      requestKey: crypto.randomUUID(),
      orderId,
      reason: reason.trim(),
      method,
      items: selected,
    };
    if (!saved && !recovery.save(request)) return;
    busy.current = true;
    startTransition(async () => {
      try {
        const result = await processRefundAction(request);
        if (!result.success) {
          toast.error(result.error || "Return failed.");
          if (!result.retryable) {
            recovery.clear();
            router.refresh();
          }
          return;
        }
        if (!recovery.clear()) return;
        toast.success(result.message);
        setOpen(false);
        setQuantities({});
        setRestock({});
        setReason("");
        router.refresh();
      } catch {
        toast.error(
          "Return result unknown. Retry the saved return; do not refund the customer twice.",
        );
      } finally {
        busy.current = false;
      }
    });
  };

  const unavailable = hasLegacyRefund || orderStatus !== "COMPLETED";
  return (
    <>
      <Button
        variant="destructive"
        onClick={() => setOpen(true)}
        disabled={unavailable && !saved}
        className="text-xs"
      >
        <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
        {saved
          ? "Recover return"
          : hasLegacyRefund
            ? "Legacy refund: review required"
            : orderStatus === "REFUNDED"
              ? "Fully returned"
              : "Return items"}
      </Button>
      <Dialog
        open={open || !!saved}
        onOpenChange={(value) => {
          if (!locked) setOpen(value);
        }}
      >
        <DialogContent
          showCloseButton={!locked}
          className="sm:max-w-xl max-h-[90dvh] overflow-y-auto"
        >
          <DialogHeader>
            <DialogTitle>Return items</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Invoice {formatCurrency(orderTotal)} · Already refunded{" "}
            {formatCurrency(existingRefunds)}. Amounts use original prices and
            allocated discounts.
          </p>
          {recovery.error && (
            <p role="alert" className="text-destructive">
              {recovery.error}
            </p>
          )}
          {saved && (
            <p role="status" className="rounded-lg border border-amber-500 p-3">
              A return is awaiting confirmation. Retry to recover its original
              record. Do not pay the refund twice.
            </p>
          )}
          <div className="space-y-3">
            {items.map((item) => {
              const available =
                item.quantity -
                item.refundItems.reduce(
                  (sum, returned) => sum + returned.quantity,
                  0,
                );
              const selection = selected.find(
                (line) => line.orderItemId === item.id,
              );
              return (
                <div key={item.id} className="rounded-lg border p-3 space-y-2">
                  <p className="font-semibold">{item.name}</p>
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor={`return-${item.id}`}>
                      Quantity ({available} remaining)
                    </Label>
                    <Input
                      id={`return-${item.id}`}
                      aria-label={`Return quantity for ${item.name}`}
                      type="number"
                      min={0}
                      max={available}
                      step={1}
                      className="w-24"
                      disabled={locked || available <= 0}
                      value={selection?.quantity ?? 0}
                      onChange={(event) =>
                        setQuantities((current) => ({
                          ...current,
                          [item.id]: Number(event.target.value),
                        }))
                      }
                    />
                  </div>
                  <label className="flex gap-2 items-center text-sm">
                    <input
                      type="checkbox"
                      checked={selection?.restock ?? restock[item.id] ?? false}
                      disabled={locked || available <= 0}
                      onChange={(event) =>
                        setRestock((current) => ({
                          ...current,
                          [item.id]: event.target.checked,
                        }))
                      }
                    />
                    Return to sellable stock (received and inspected)
                  </label>
                </div>
              );
            })}
          </div>
          {!saved && (
            <p className="font-bold">Refund amount: {formatCurrency(amount)}</p>
          )}
          {quoteError && !saved && (
            <p role="alert" className="text-destructive">
              {quoteError}
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="refund-method">Refund method</Label>
            <select
              id="refund-method"
              className="w-full rounded-lg border bg-background p-2"
              value={saved?.method ?? method}
              disabled={locked}
              onChange={(event) =>
                setMethod(event.target.value as RefundRequest["method"])
              }
            >
              <option value="CASH">Cash</option>
              <option value="CARD">Card</option>
              <option value="BANK_TRANSFER">Bank transfer</option>
              <option value="QR">QR</option>
            </select>
            <p className="text-xs text-muted-foreground">
              Records a refund you arrange externally. Card, bank and QR refunds
              are not sent automatically.
            </p>
            <Label htmlFor="refund-reason">Reason</Label>
            <Textarea
              id="refund-reason"
              value={saved?.reason ?? reason}
              disabled={locked}
              maxLength={2000}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Why are these items being returned?"
            />
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              disabled={locked}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleRefund}
              disabled={
                isPending ||
                !recovery.ready ||
                (!saved &&
                  (unavailable ||
                    !selected.length ||
                    !!quoteError ||
                    !reason.trim()))
              }
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing…
                </>
              ) : saved ? (
                "Retry saved return"
              ) : (
                "Confirm return"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
