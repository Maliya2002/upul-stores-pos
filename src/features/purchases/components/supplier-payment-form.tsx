"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { addSupplierPaymentAction } from "@/features/suppliers/actions/supplier-actions";
import type { SupplierPaymentValues } from "@/features/suppliers/schemas/supplier-schema";

export function SupplierPaymentForm({
  purchaseId,
  supplierId,
  outstanding,
}: {
  purchaseId: string;
  supplierId: string;
  outstanding: number;
}) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<SupplierPaymentValues["method"]>("CASH");
  const [reference, setReference] = useState("");
  const [pending, startTransition] = useTransition();
  const busy = useRef(false);
  const router = useRouter();
  const key = `supplier-payment-${purchaseId}`;
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(key);
      if (saved) {
        const value = JSON.parse(saved);
        setAmount(String(value.amount));
        setMethod(value.method);
        setReference(value.reference);
      }
    } catch {
      toast.error("Could not restore pending payment. Check payment history.");
    }
  }, [key]);
  return (
    <form
      className="flex flex-wrap items-end gap-3 rounded border p-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (busy.current) return;
        busy.current = true;
        startTransition(async () => {
          try {
            const values = {
              purchaseId,
              supplierId,
              amount: Number(amount),
              method,
              reference,
              notes: "",
            };
            const saved = sessionStorage.getItem(key);
            const request = saved
              ? JSON.parse(saved)
              : { ...values, requestKey: crypto.randomUUID() };
            if (
              saved &&
              (request.amount !== values.amount ||
                request.method !== method ||
                request.reference !== reference)
            ) {
              toast.error(
                "Reload to restore and confirm the pending payment before changing it.",
              );
              return;
            }
            sessionStorage.setItem(key, JSON.stringify(request));
            const result = await addSupplierPaymentAction(request);
            if (!result.success) {
              if (!result.retryable) sessionStorage.removeItem(key);
              toast.error(result.error);
              return;
            }
            sessionStorage.removeItem(key);
            setAmount("");
            setReference("");
            toast.success(result.message);
            router.refresh();
          } catch {
            toast.error("Outcome unconfirmed. Retry the same payment.");
          } finally {
            busy.current = false;
          }
        });
      }}
    >
      <p className="w-full text-sm">
        Record a payment already made. Outstanding: Rs. {outstanding.toFixed(2)}
        . This does not transfer money or adjust a cash shift.
      </p>
      <label className="flex flex-col gap-1">
        Amount
        <input
          className="h-10 rounded border bg-background px-3"
          type="number"
          min="0.01"
          step="0.01"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </label>
      <label className="flex flex-col gap-1">
        Method
        <select
          className="h-10 rounded border bg-background px-3"
          value={method}
          onChange={(e) =>
            setMethod(e.target.value as SupplierPaymentValues["method"])
          }
        >
          <option>CASH</option>
          <option>CARD</option>
          <option>BANK_TRANSFER</option>
          <option>QR</option>
        </select>
      </label>
      <label className="flex flex-col gap-1">
        Reference
        <input
          className="h-10 rounded border bg-background px-3"
          value={reference}
          maxLength={200}
          onChange={(e) => setReference(e.target.value)}
        />
      </label>
      <button
        disabled={pending}
        className="h-10 rounded bg-primary px-4 text-primary-foreground"
      >
        {pending ? "Recording�" : "Record payment / retry"}
      </button>
    </form>
  );
}
