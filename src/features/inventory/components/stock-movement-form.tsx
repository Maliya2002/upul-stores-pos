"use client";

import { useTransition } from "react";
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
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
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

  const selectedProductId = (watch("productId") ?? "") as string;
  const selectedProduct = selectedProductId
    ? products.find((p) => p.id === selectedProductId)
    : null;

const onSubmit = (values: StockMovementValues) => {
  startTransition(async () => {
    const action = mode === "in" ? stockInAction : stockOutAction;
    const result = await action(values);

    if (!result.success) {
      toast.error(result.error || "Failed.");
      return;
    }

    toast.success(result.message || "Stock updated.");
    router.push("/inventory");
    router.refresh();
  });
};
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
            <Label>Notes (Optional)</Label>
            <Textarea rows={3} {...register("notes")} />
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