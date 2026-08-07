import { z } from "zod";

export const expenseSchema = z.object({
  title: z.string().min(2, "Title is required"),
  amount: z.coerce.number().min(1, "Amount must be greater than 0"),
  category: z.enum(["SALARY", "ELECTRICITY", "TRANSPORT", "RENT", "INTERNET", "MAINTENANCE", "MARKETING", "OTHER"]),
  description: z.string().optional().default(""),
});

export type ExpenseFormInput = z.input<typeof expenseSchema>;
export type ExpenseFormValues = z.output<typeof expenseSchema>;