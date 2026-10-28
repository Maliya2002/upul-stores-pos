import { z } from "zod";

export const stockMovementSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  type: z.enum([
    "PURCHASE",
    "SALE",
    "ADJUSTMENT",
    "TRANSFER",
    "DAMAGED",
    "EXPIRED",
    "RETURN",
  ]),
  quantity: z.coerce
    .number()
    .int()
    .min(1, "Quantity must be at least 1")
    .max(1000000),
  reference: z.string().max(200).optional().default(""),
  notes: z.string().trim().min(1, "A reason is required").max(2000),
});

export type StockMovementInput = z.input<typeof stockMovementSchema>;
export type StockMovementValues = z.output<typeof stockMovementSchema>;
