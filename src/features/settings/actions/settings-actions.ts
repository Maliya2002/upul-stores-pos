"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

export async function getAllSettings() {
  const settings = await prisma.settings.findMany({
    orderBy: { key: "asc" },
  });

  const map: Record<string, string> = {};
  settings.forEach((s) => {
    map[s.key] = s.value;
  });

  return map;
}

export async function updateSettingAction(key: string, value: string) {
  try {
    await prisma.settings.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    revalidatePath("/settings");
    return { success: true, message: `${key} updated.` };
  } catch {
    return { success: false, error: "Failed to update setting." };
  }
}

export async function updateMultipleSettingsAction(
  updates: { key: string; value: string }[]
) {
  try {
    for (const item of updates) {
      await prisma.settings.upsert({
        where: { key: item.key },
        update: { value: item.value },
        create: { key: item.key, value: item.value },
      });
    }

    revalidatePath("/settings");
    return { success: true, message: "Settings saved successfully." };
  } catch {
    return { success: false, error: "Failed to save settings." };
  }
}

export async function getSystemInfo() {
  const [
    userCount,
    productCount,
    customerCount,
    orderCount,
    categoryCount,
    brandCount,
    supplierCount,
    expenseCount,
    movementCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.customer.count(),
    prisma.order.count(),
    prisma.category.count(),
    prisma.brand.count(),
    prisma.supplier.count(),
    prisma.expense.count(),
    prisma.stockMovement.count(),
  ]);

  return {
    users: userCount,
    products: productCount,
    customers: customerCount,
    orders: orderCount,
    categories: categoryCount,
    brands: brandCount,
    suppliers: supplierCount,
    expenses: expenseCount,
    stockMovements: movementCount,
    appVersion: "1.0.0",
    framework: "Next.js 16",
    database: "PostgreSQL",
    orm: "Prisma 6",
  };
}

export async function exportDatabaseAction() {
  try {
    const [
      users,
      products,
      categories,
      brands,
      suppliers,
      customers,
      orders,
      expenses,
      settings,
    ] = await Promise.all([
      prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, phone: true, isActive: true } }),
      prisma.product.findMany(),
      prisma.category.findMany(),
      prisma.brand.findMany(),
      prisma.supplier.findMany(),
      prisma.customer.findMany(),
      prisma.order.findMany({ include: { items: true } }),
      prisma.expense.findMany(),
      prisma.settings.findMany(),
    ]);

    const backup = {
      exportedAt: new Date().toISOString(),
      version: "1.0.0",
      data: {
        users,
        products,
        categories,
        brands,
        suppliers,
        customers,
        orders,
        expenses,
        settings,
      },
    };

    return {
      success: true,
      data: JSON.stringify(backup, null, 2),
      filename: `upul-stores-backup-${new Date().toISOString().split("T")[0]}.json`,
    };
  } catch {
    return { success: false, error: "Failed to export database." };
  }
}