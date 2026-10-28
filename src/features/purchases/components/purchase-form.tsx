"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormSection } from "@/components/forms";
import { formatCurrency } from "@/lib/utils";
import { createPurchaseAction } from "../actions/purchase-actions";

interface PurchaseItem {
  productId: string;
  name: string;
  quantity: number;
  unitCost: number;
}

interface PurchaseFormProps {
  suppliers: { id: string; name: string }[];
  products: { id: string; name: string; sku: string; purchasePrice: number }[];
}

export function PurchaseForm({ suppliers, products }: PurchaseFormProps) {
  const router = useRouter();
  const busy = useRef(false);
  const storageKey = "pending-purchase-v1";
  const [isPending, startTransition] = useTransition();
  const [supplierId, setSupplierId] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<PurchaseItem[]>([]);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(storageKey);
      if (saved) {
        const pending = JSON.parse(saved);
        setSupplierId(pending.supplierId);
        setNotes(pending.notes);
        setItems(pending.items);
        toast.info("Pending purchase restored. Retry to confirm its outcome.");
      }
    } catch {
      toast.error(
        "Could not restore the pending purchase. Check purchase history before submitting.",
      );
    }
  }, []);

  const addItem = () => {
    setItems([...items, { productId: "", name: "", quantity: 1, unitCost: 0 }]);
  };

  const updateItem = (
    index: number,
    field: keyof PurchaseItem,
    value: string | number,
  ) => {
    const newItems = [...items];

    if (field === "productId") {
      const product = products.find((p) => p.id === String(value));
      if (product) {
        newItems[index] = {
          ...newItems[index],
          productId: String(value),
          name: product.name,
          unitCost: product.purchasePrice,
        };
      }
    } else if (field === "quantity") {
      newItems[index] = {
        ...newItems[index],
        quantity: Number(value) || 0,
      };
    } else if (field === "unitCost") {
      newItems[index] = {
        ...newItems[index],
        unitCost: Number(value) || 0,
      };
    } else if (field === "name") {
      newItems[index] = {
        ...newItems[index],
        name: String(value),
      };
    }

    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const total = items.reduce(
    (sum, item) => sum + item.unitCost * item.quantity,
    0,
  );

  const handleSubmit = () => {
    if (!supplierId) {
      toast.error("Select a supplier.");
      return;
    }
    if (items.length === 0) {
      toast.error("Add at least one item.");
      return;
    }

    const hasEmptyProduct = items.some((item) => !item.productId);
    if (hasEmptyProduct) {
      toast.error("Select a product for all items.");
      return;
    }

    if (busy.current) return;
    busy.current = true;
    startTransition(async () => {
      try {
        const payload = {
          supplierId,
          paymentMethod: "CASH" as const,
          notes,
          items,
        };
        const saved = sessionStorage.getItem(storageKey);
        const pending = saved
          ? JSON.parse(saved)
          : { ...payload, requestKey: crypto.randomUUID() };
        if (
          saved &&
          JSON.stringify({
            supplierId: pending.supplierId,
            paymentMethod: pending.paymentMethod,
            notes: pending.notes,
            items: pending.items,
          }) !== JSON.stringify(payload)
        ) {
          toast.error(
            "A purchase is awaiting confirmation. Reload to restore it, then retry before changing its details.",
          );
          return;
        }
        sessionStorage.setItem(storageKey, JSON.stringify(pending));
        const result = await createPurchaseAction(pending);
        if (!result.success) {
          if (!result.retryable) sessionStorage.removeItem(storageKey);
          toast.error(result.error || "Failed.");
          return;
        }
        sessionStorage.removeItem(storageKey);
        toast.success(result.message || "Purchase recorded.");
        router.push("/purchases");
        router.refresh();
      } catch {
        toast.error(
          "Outcome unconfirmed. Keep this request and retry; check purchase history before starting another.",
        );
      } finally {
        busy.current = false;
      }
    });
  };

  return (
    <div className="space-y-6">
      <p className="rounded-lg border p-4 text-sm">
        Record goods already received and fully paid in cash. Stock increases
        immediately. This is not a pending purchase order or supplier-credit
        entry.
      </p>
      <FormSection title="Purchase Details">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Supplier</Label>
            <Select
              value={supplierId || "none"}
              onValueChange={(v) =>
                setSupplierId(v === "none" ? "" : (v ?? ""))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select supplier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Select supplier</SelectItem>
                {suppliers.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>
      </FormSection>

      <FormSection title="Purchase Items">
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={index}
              className="grid gap-3 md:grid-cols-4 items-end rounded-xl border p-4"
            >
              <div className="space-y-2">
                <Label>Product</Label>
                <Select
                  value={item.productId || "none"}
                  onValueChange={(v) =>
                    updateItem(
                      index,
                      "productId",
                      v === "none" ? "" : (v ?? ""),
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Select product</SelectItem>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} ({p.sku})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Qty</Label>
                <Input
                  type="number"
                  min="1"
                  value={String(item.quantity)}
                  onChange={(e) =>
                    updateItem(index, "quantity", Number(e.target.value))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Unit Cost</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={String(item.unitCost)}
                  onChange={(e) =>
                    updateItem(index, "unitCost", Number(e.target.value))
                  }
                />
              </div>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => removeItem(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button variant="outline" onClick={addItem} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>

        {items.length > 0 && (
          <div className="mt-4 text-right text-lg font-black">
            Total: {formatCurrency(total)}
          </div>
        )}
      </FormSection>

      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Record Received Purchase"
          )}
        </Button>
      </div>
    </div>
  );
}
