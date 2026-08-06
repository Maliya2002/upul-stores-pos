import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters"),
  description: z.string().optional().default(""),
  image: z.string().optional().default(""),
  parentId: z.string().optional().default(""),
  isActive: z.boolean().default(true),
});

export type CategoryFormInput = z.input<typeof categorySchema>;
export type CategoryFormValues = z.output<typeof categorySchema>;