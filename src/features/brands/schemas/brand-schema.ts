import { z } from "zod";

export const brandSchema = z.object({
  name: z.string().min(2, "Brand name must be at least 2 characters"),
  description: z.string().optional().default(""),
  logo: z.string().optional().default(""),
  isActive: z.boolean().default(true),
});

export type BrandFormInput = z.input<typeof brandSchema>;
export type BrandFormValues = z.output<typeof brandSchema>;