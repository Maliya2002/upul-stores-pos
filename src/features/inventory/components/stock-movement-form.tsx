"use client";

import { useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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

import {
  stockMovementSchema,
  type StockMovementInput,
  type StockMovementValues,
} from "../schemas/inventory-schema";
import { stockInAction, stockOutAction } from "../actions/inventory-actions";

interface StockMovementFormProps {
  mode: "in" | "out";
  defaultType: string;
  products: {
    id: string;
    name: string;
    sku: string;
    quantity: number;
  }[];
}

export function StockMovementForm({
  mode,
  defaultType,
  products,
}: StockMovementFormProps) {
  const router = useRouter();
  const busy = useRef(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<StockMovementInput, unknown, StockMovementValues>({
    resolver: zodResolver(stockMovementSchema),
    defaultValues: {
      productId: "",
      type: defaultType as StockMovementValues["type"],
      quantity: 1,
      reference: "",
      notes: "",
    },
  });

  const storageKey = `pending-stock-${mode}-v1`;
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(storageKey);
      if (saved) {
        reset(JSON.parse(saved).values);
        toast.info(
          "Pending stock adjustment restored. Submit to confirm the same request.",
        );
      }
    } catch {
      toast.error(
        "Could not restore adjustment. Check movement history before proceeding.",
      );
    }
  }, [reset, storageKey]);

  const selectedProductId = (watch("productId") ?? "") as string;
  const selectedProduct = selectedProductId
    ? products.find((p) => p.id === selectedProductId)
    : null;

  const onSubmit = (values: StockMovementValues) => {
    if (busy.current) return;
    busy.current = true;
    startTransition(async () => {
      try {
        const action = mode === "in" ? stockInAction : stockOutAction;
        const saved = sessionStorage.getItem(storageKey);
        const pending = saved
          ? JSON.parse(saved)
          : { key: crypto.randomUUID(), values };
        if (
          saved &&
          JSON.stringify(stockMovementSchema.parse(pending.values)) !==
            JSON.stringify(values)
        ) {
          toast.error(
            "An adjustment is awaiting confirmation. Reload to restore it and confirm it before making changes.",
          );
          return;
        }
        sessionStorage.setItem(storageKey, JSON.stringify(pending));
        const result = await action(values, pending.key);

        if (!result.success) {
          if (!result.retryable) sessionStorage.removeItem(storageKey);
          toast.error(result.error || "Failed.");
          return;
        }

        sessionStorage.removeItem(storageKey);
        toast.success(result.message || "Stock updated.");
        router.push("/inventory");
        router.refresh();
      } catch {
        toast.error("Outcome unconfirmed. Retry this same adjustment.");
      } finally {
        busy.current = false;
      }
    });
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <p className="rounded-lg border p-4 text-sm">
        Manual stock correction only. Record purchases and customer returns in
        their respective workflows. Pending adjustments are restored after
        reload in this tab. Retry the same adjustment to confirm its outcome.
      </p>
      <FormSection
        title={mode === "in" ? "Stock In Details" : "Stock Out Details"}
        description={
          mode === "in"
            ? "Add stock to a product"
            : "Remove stock from a product"
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label>Product</Label>
            <Select
              value={selectedProductId}
              onValueChange={(v) => setValue("productId", v ?? "")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    <span className="font-medium">{product.name}</span>
                    <span className="text-muted-foreground ml-2 text-xs">
                      (SKU: {product.sku} · Stock: {product.quantity})
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.productId && (
              <p className="text-xs text-destructive">
                {errors.productId.message as string}
              </p>
            )}
          </div>

          {selectedProduct && (
            <div className="md:col-span-2 rounded-xl border border-primary/20 bg-primary/5 p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">Current Stock</p>
                  <p className="text-2xl font-black text-primary">
                    {selectedProduct.quantity}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Product</p>
                  <p className="text-sm font-bold">{selectedProduct.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">SKU</p>
                  <p className="text-sm font-mono">{selectedProduct.sku}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {mode === "out" && (
              <label className="flex flex-col gap-1 mb-3">
                Reason category
                <select
                  className="h-10 rounded border bg-background px-3"
                  {...register("type")}
                >
                  <option value="DAMAGED">Damaged</option>
                  <option value="EXPIRED">Expired</option>
                  <option value="ADJUSTMENT">Count correction</option>
                </select>
              </label>
            )}
            <Label>Quantity</Label>
            <Input type="number" min="1" {...register("quantity")} />
            {errors.quantity && (
              <p className="text-xs text-destructive">
                {errors.quantity.message as string}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Reference (Optional)</Label>
            <Input
              placeholder="Invoice #, PO #, etc."
              {...register("reference")}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Reason</Label>
            <Textarea rows={3} {...register("notes")} />
            {errors.notes && (
              <p className="text-xs text-destructive">{errors.notes.message}</p>
            )}
          </div>
        </div>
      </FormSection>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : mode === "in" ? (
            "Add Stock"
          ) : (
            "Remove Stock"
          )}
        </Button>
      </div>
    </form>
  );
}
