import { z } from "zod";

const optionalText = z
  .string()
  .optional()
  .nullable()
  .transform((value) => (value ?? "").trim());

const optionalNumber = z
  .union([z.string(), z.number(), z.null(), z.undefined()])
  .transform((value, ctx) => {
    if (value === "" || value === null || value === undefined) {
      return undefined;
    }

    const parsed = typeof value === "number" ? value : Number(value);

    if (Number.isNaN(parsed) || parsed < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Value must be a valid non-negative number",
      });
      return z.NEVER;
    }

    return parsed;
  });

export const productVariantSchema = z.object({
  name: z.string().min(1, "Variant name is required"),
  sku: z.string().min(1, "Variant SKU is required"),
  barcode: optionalText,
  price: z.coerce.number().min(0, "Variant price must be 0 or more"),
  quantity: z.coerce
    .number()
    .int("Variant quantity must be a whole number")
    .min(0, "Variant quantity must be 0 or more"),
  color: optionalText,
  size: optionalText,
  image: optionalText,
  isActive: z.boolean().default(true),
});

export const productSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  sku: z.string().min(2, "SKU is required"),
  barcode: optionalText,
  description: optionalText,
  categoryId: z.string().min(1, "Category is required"),
  brandId: optionalText,
  supplierId: optionalText,
  purchasePrice: z.coerce
    .number()
    .min(0, "Purchase price must be 0 or more"),
  sellingPrice: z.coerce.number().min(0, "Selling price must be 0 or more"),
  tax: z.coerce.number().min(0, "Tax must be 0 or more").default(0),
  discount: z.coerce.number().min(0, "Discount must be 0 or more").default(0),
  quantity: z.coerce
    .number()
    .int("Quantity must be a whole number")
    .min(0, "Quantity must be 0 or more"),
  minimumStock: z.coerce
    .number()
    .int("Minimum stock must be a whole number")
    .min(0, "Minimum stock must be 0 or more"),
  unit: z.string().min(1, "Unit is required"),
  weight: optionalNumber,
  color: optionalText,
  size: optionalText,
  status: z.enum(["ACTIVE", "INACTIVE", "DISCONTINUED"]),
  expiryDate: optionalText,
  batchNumber: optionalText,
  images: z.array(z.string()).default([]),
  hasVariants: z.boolean().default(false),
  isActive: z.boolean().default(true),
  variants: z.array(productVariantSchema).default([]),
});

export type ProductVariantFormInput = z.input<typeof productVariantSchema>;
export type ProductVariantFormValues = z.output<typeof productVariantSchema>;

export type ProductFormInput = z.input<typeof productSchema>;
export type ProductFormValues = z.output<typeof productSchema>;

export interface ProductSelectOption {
  id: string;
  name: string;
}

export interface ProductFormInitialData {
  id: string;
  name: string;
  sku: string;
  barcode?: string | null;
  description?: string | null;
  categoryId: string;
  brandId?: string | null;
  supplierId?: string | null;
  purchasePrice: number;
  sellingPrice: number;
  tax: number;
  discount: number;
  quantity: number;
  minimumStock: number;
  unit: string;
  weight?: number | null;
  color?: string | null;
  size?: string | null;
  status: "ACTIVE" | "INACTIVE" | "DISCONTINUED";
  expiryDate?: string | null;
  batchNumber?: string | null;
  images: string[];
  hasVariants: boolean;
  isActive: boolean;
  variants: ProductVariantFormValues[];
}