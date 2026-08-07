import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().min(2, "Customer name must be at least 2 characters"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional().default(""),
  address: z.string().optional().default(""),
  membershipLevel: z.enum(["BRONZE", "SILVER", "GOLD", "PLATINUM"]).default("BRONZE"),
  loyaltyPoints: z.coerce.number().int().min(0).default(0),
  creditBalance: z.coerce.number().min(0).default(0),
  isActive: z.boolean().default(true),
});

export type CustomerFormInput = z.input<typeof customerSchema>;
export type CustomerFormValues = z.output<typeof customerSchema>;