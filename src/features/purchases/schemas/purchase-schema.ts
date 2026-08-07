import { z } from "zod";

export const purchaseItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  name: z.string(),
  quantity: z.coerce.number().int().min(1, "Qty must be at least 1"),
  unitCost: z.coerce.number().min(0, "Cost must be 0 or more"),
});

export const purchaseSchema = z.object({
  supplierId: z.string().min(1, "Supplier is required"),
  paymentMethod: z.enum(["CASH", "CARD", "BANK_TRANSFER", "QR", "GIFT_CARD", "MIXED"]).default("CASH"),
  notes: z.string().optional().default(""),
  items: z.array(purchaseItemSchema).min(1, "At least 1 item required"),
});

export type PurchaseItemInput = z.input<typeof purchaseItemSchema>;
export type PurchaseFormInput = z.input<typeof purchaseSchema>;
export type PurchaseFormValues = z.output<typeof purchaseSchema>;