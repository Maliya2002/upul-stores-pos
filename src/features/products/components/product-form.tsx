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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormSection } from "@/components/forms";

import {
  productSchema,
  type ProductFormInput,
  type ProductFormValues,
  type ProductFormInitialData,
  type ProductSelectOption,
} from "../schemas/product-schema";
import {
  createProductAction,
  updateProductAction,
} from "../actions/product-actions";
import { ProductImageUpload } from "./product-image-upload";
import { ProductVariantForm } from "./product-variant-form";

interface ProductFormProps {
  mode: "create" | "edit";
  productId?: string;
  initialData?: ProductFormInitialData;
  categories: ProductSelectOption[];
  brands: ProductSelectOption[];
  suppliers: ProductSelectOption[];
}

export function ProductForm({
  mode,
  productId,
  initialData,
  categories,
  brands,
  suppliers,
}: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<ProductFormInput, unknown, ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      sku: initialData?.sku ?? "",
      barcode: initialData?.barcode ?? "",
      description: initialData?.description ?? "",
      categoryId: initialData?.categoryId ?? "",
      brandId: initialData?.brandId ?? "",
      supplierId: initialData?.supplierId ?? "",
      purchasePrice: initialData?.purchasePrice ?? 0,
      sellingPrice: initialData?.sellingPrice ?? 0,
      tax: initialData?.tax ?? 0,
      discount: initialData?.discount ?? 0,
      quantity: initialData?.quantity ?? 0,
      minimumStock: initialData?.minimumStock ?? 10,
      unit: initialData?.unit ?? "pcs",
      weight: initialData?.weight ?? "",
      color: initialData?.color ?? "",
      size: initialData?.size ?? "",
      status: initialData?.status ?? "ACTIVE",
      expiryDate: initialData?.expiryDate ?? "",
      batchNumber: initialData?.batchNumber ?? "",
      images: initialData?.images ?? [],
      hasVariants: initialData?.hasVariants ?? false,
      isActive: initialData?.isActive ?? true,
      variants: initialData?.variants ?? [],
    },
  });

  const categoryValue = (watch("categoryId") ?? "") as string;
  const brandValue = (watch("brandId") ?? "") as string;
  const supplierValue = (watch("supplierId") ?? "") as string;
  const statusValue = (watch("status") ?? "ACTIVE") as
    | "ACTIVE"
    | "INACTIVE"
    | "DISCONTINUED";
  const images = ((watch("images") ?? []) as string[]).filter(Boolean);
  const hasVariants = Boolean(watch("hasVariants"));
  const isActive = Boolean(watch("isActive"));

  const onSubmit = (values: ProductFormValues) => {
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createProductAction(values)
          : await updateProductAction(productId || "", values);

      if (!result.success) {
        toast.error(result.error || "Something went wrong.");
        return;
      }

      toast.success(result.message || "Success");

      const newId =
        "productId" in result
          ? (result as { productId?: string | null }).productId
          : undefined;

      if (newId) {
        router.push(`/products/${newId}`);
        router.refresh();
      } else {
        router.push("/products");
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormSection
        title="Basic Information"
        description="Main product details and identification"
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="space-y-2 xl:col-span-2">
            <Label htmlFor="name">Product Name</Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-xs text-destructive">
                {errors.name.message as string}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <Input id="sku" {...register("sku")} />
            {errors.sku && (
              <p className="text-xs text-destructive">
                {errors.sku.message as string}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="barcode">Barcode</Label>
            <Input id="barcode" {...register("barcode")} />
          </div>

          <div className="space-y-2 md:col-span-2 xl:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={4} {...register("description")} />
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={categoryValue}
              onValueChange={(value) => setValue("categoryId", value ?? "")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoryId && (
              <p className="text-xs text-destructive">
                {errors.categoryId.message as string}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Brand</Label>
            <Select
              value={brandValue || "none"}
              onValueChange={(value) =>
                setValue("brandId", value === "none" ? "" : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No brand</SelectItem>
                {brands.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Supplier</Label>
            <Select
              value={supplierValue || "none"}
              onValueChange={(value) =>
                setValue("supplierId", value === "none" ? "" : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select supplier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No supplier</SelectItem>
                {suppliers.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Pricing & Stock"
        description="Manage price, stock and tax details"
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2">
            <Label>Purchase Price</Label>
            <Input type="number" step="0.01" {...register("purchasePrice")} />
          </div>

          <div className="space-y-2">
            <Label>Selling Price</Label>
            <Input type="number" step="0.01" {...register("sellingPrice")} />
          </div>

          <div className="space-y-2">
            <Label>Tax (%)</Label>
            <Input type="number" step="0.01" {...register("tax")} />
          </div>

          <div className="space-y-2">
            <Label>Discount (%)</Label>
            <Input type="number" step="0.01" {...register("discount")} />
          </div>

          <div className="space-y-2">
            <Label>Quantity</Label>
            <Input type="number" {...register("quantity")} />
          </div>

          <div className="space-y-2">
            <Label>Minimum Stock</Label>
            <Input type="number" {...register("minimumStock")} />
          </div>

          <div className="space-y-2">
            <Label>Unit</Label>
            <Input placeholder="pcs / kg / bag" {...register("unit")} />
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={statusValue}
              onValueChange={(value) =>
                setValue(
                  "status",
                  value as "ACTIVE" | "INACTIVE" | "DISCONTINUED"
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="DISCONTINUED">Discontinued</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Additional Details"
        description="Optional details like expiry, color, size and weight"
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2">
            <Label>Weight</Label>
            <Input type="number" step="0.01" {...register("weight")} />
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <Input {...register("color")} />
          </div>

          <div className="space-y-2">
            <Label>Size</Label>
            <Input {...register("size")} />
          </div>

          <div className="space-y-2">
            <Label>Batch Number</Label>
            <Input {...register("batchNumber")} />
          </div>

          <div className="space-y-2">
            <Label>Expiry Date</Label>
            <Input type="date" {...register("expiryDate")} />
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Product Images"
        description="Add multiple image URLs for this product"
      >
        <ProductImageUpload
          value={images}
          onChange={(value) => setValue("images", value)}
        />
      </FormSection>

      <FormSection
        title="Variant Settings"
        description="Enable variants if this product has multiple versions"
      >
        <div className="space-y-5">
          <div className="flex items-center justify-between rounded-xl border p-4">
            <div>
              <p className="font-medium">Enable Variants</p>
              <p className="text-sm text-muted-foreground">
                Use this for multiple sizes, colors or packaging options
              </p>
            </div>
            <Switch
              checked={hasVariants}
              onCheckedChange={(value) => setValue("hasVariants", value)}
            />
          </div>

          {hasVariants && (
            <ProductVariantForm
              control={control}
              register={register}
              errors={errors}
            />
          )}
        </div>
      </FormSection>

      <FormSection
        title="Visibility"
        description="Control whether this product is active in the system"
      >
        <div className="flex items-center justify-between rounded-xl border p-4">
          <div>
            <p className="font-medium">Active Product</p>
            <p className="text-sm text-muted-foreground">
              Inactive products can be hidden from future operations
            </p>
          </div>
          <Switch
            checked={isActive}
            onCheckedChange={(value) => setValue("isActive", value)}
          />
        </div>
      </FormSection>

      <div className="flex flex-wrap items-center justify-end gap-3">
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
              {mode === "create" ? "Creating..." : "Updating..."}
            </>
          ) : mode === "create" ? (
            "Create Product"
          ) : (
            "Update Product"
          )}
        </Button>
      </div>
    </form>
  );
}