"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { expenseSchema, type ExpenseFormValues } from "../schemas/expense-schema";

export async function getExpenses() {
  return prisma.expense.findMany({ orderBy: { createdAt: "desc" } });
}

export async function getExpenseStats() {
  const total = await prisma.expense.aggregate({ _sum: { amount: true } });
  const byCategory = await prisma.expense.groupBy({
    by: ["category"],
    _sum: { amount: true },
    _count: true,
  });
  return { total: total._sum.amount ?? 0, byCategory };
}

export async function createExpenseAction(input: ExpenseFormValues) {
  const validated = expenseSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0]?.message ?? "Invalid data" };
  }

  try {
    await prisma.expense.create({
      data: {
        title: validated.data.title.trim(),
        amount: validated.data.amount,
        category: validated.data.category,
        description: validated.data.description?.trim() || null,
      },
    });
    revalidatePath("/expenses");
    return { success: true, message: "Expense recorded." };
  } catch {
    return { success: false, error: "Failed to record expense." };
  }
}

export async function deleteExpenseAction(id: string) {
  try {
    await prisma.expense.delete({ where: { id } });
    revalidatePath("/expenses");
    return { success: true, message: "Expense deleted." };
  } catch {
    return { success: false, error: "Failed to delete." };
  }
}