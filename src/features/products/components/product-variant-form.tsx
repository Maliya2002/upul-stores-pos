"use client";

import { Plus, Trash2 } from "lucide-react";
import {
  useFieldArray,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  ProductFormInput,
  ProductFormValues,
} from "../schemas/product-schema";

interface ProductVariantFormProps {
  control: Control<ProductFormInput, unknown, ProductFormValues>;
  register: UseFormRegister<ProductFormInput>;
  errors: FieldErrors<ProductFormInput>;
}

export function ProductVariantForm({
  control,
  register,
  errors,
}: ProductVariantFormProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Product Variants</p>
          <p className="text-xs text-muted-foreground">
            Add size, color, or package variants
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() =>
            append({
              name: "",
              sku: "",
              barcode: "",
              price: 0,
              quantity: 0,
              color: "",
              size: "",
              image: "",
              isActive: true,
            })
          }
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Variant
        </Button>
      </div>

      {fields.length === 0 ? (
        <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
          No variants added yet.
        </div>
      ) : (
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="rounded-xl border p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">Variant {index + 1}</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input {...register(`variants.${index}.name`)} />
                  {errors.variants?.[index]?.name && (
                    <p className="text-xs text-destructive">
                      {errors.variants[index]?.name?.message as string}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>SKU</Label>
                  <Input {...register(`variants.${index}.sku`)} />
                  {errors.variants?.[index]?.sku && (
                    <p className="text-xs text-destructive">
                      {errors.variants[index]?.sku?.message as string}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Barcode</Label>
                  <Input {...register(`variants.${index}.barcode`)} />
                </div>

                <div className="space-y-2">
                  <Label>Price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register(`variants.${index}.price`)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    {...register(`variants.${index}.quantity`)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Color</Label>
                  <Input {...register(`variants.${index}.color`)} />
                </div>

                <div className="space-y-2">
                  <Label>Size</Label>
                  <Input {...register(`variants.${index}.size`)} />
                </div>

                <div className="space-y-2 xl:col-span-2">
                  <Label>Image URL</Label>
                  <Input {...register(`variants.${index}.image`)} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}