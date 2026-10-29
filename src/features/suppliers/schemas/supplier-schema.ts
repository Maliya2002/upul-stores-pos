import { z } from "zod";

export const supplierSchema = z.object({
  name: z.string().min(2, "Supplier name must be at least 2 characters"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().min(5, "Phone number is required"),
  address: z.string().optional().default(""),
  company: z.string().optional().default(""),
  taxNumber: z.string().optional().default(""),
  isActive: z.boolean().default(true),
});

export type SupplierFormInput = z.input<typeof supplierSchema>;
export type SupplierFormValues = z.output<typeof supplierSchema>;

export const supplierPaymentSchema = z.object({
  requestKey: z.string().uuid(),
  purchaseId: z.string().min(1, "Choose a purchase"),
  supplierId: z.string().min(1, "Supplier is required"),
  amount: z.coerce
    .number()
    .min(0.01, "Amount must be greater than 0")
    .max(100000000)
    .refine(
      (v) => Math.abs(v * 100 - Math.round(v * 100)) < 0.00001,
      "Use at most two decimal places",
    ),
  method: z.enum(["CASH", "CARD", "BANK_TRANSFER", "QR"]),
  reference: z.string().max(200).optional().default(""),
  notes: z.string().max(2000).optional().default(""),
});

export type SupplierPaymentInput = z.input<typeof supplierPaymentSchema>;
export type SupplierPaymentValues = z.output<typeof supplierPaymentSchema>;
