import { z } from "zod";

export const purchaseItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  name: z.string(),
  quantity: z.coerce
    .number()
    .int()
    .min(1, "Qty must be at least 1")
    .max(1000000),
  unitCost: z.coerce
    .number()
    .min(0, "Cost must be 0 or more")
    .max(100000000)
    .refine(
      (v) => Math.abs(v * 100 - Math.round(v * 100)) < 0.00001,
      "Use at most two decimal places",
    ),
});

export const purchaseSchema = z.object({
  requestKey: z.string().uuid("A transaction reference is required"),
  paidAmount: z
    .number()
    .min(0)
    .max(100000000)
    .refine(
      (v) => Math.abs(v * 100 - Math.round(v * 100)) < 0.00001,
      "Use at most two decimal places",
    )
    .optional(),
  supplierId: z.string().min(1, "Supplier is required"),
  paymentMethod: z
    .enum(["CASH", "CARD", "BANK_TRANSFER", "QR", "GIFT_CARD", "MIXED"])
    .default("CASH"),
  notes: z.string().max(2000).optional().default(""),
  items: z
    .array(purchaseItemSchema)
    .min(1, "At least 1 item required")
    .max(500),
});

export type PurchaseItemInput = z.input<typeof purchaseItemSchema>;
export type PurchaseFormInput = z.input<typeof purchaseSchema>;
export type PurchaseFormValues = z.output<typeof purchaseSchema>;
