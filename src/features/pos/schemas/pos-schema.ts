import { z } from "zod";

export const paymentSchema = z.object({
  method: z.enum(["CASH", "CARD", "BANK_TRANSFER", "QR", "GIFT_CARD", "MIXED"]),
  paidAmount: z.coerce.number().min(0, "Amount must be 0 or more"),
  reference: z.string().optional().default(""),
});

export type PaymentInput = z.input<typeof paymentSchema>;
export type PaymentValues = z.output<typeof paymentSchema>;