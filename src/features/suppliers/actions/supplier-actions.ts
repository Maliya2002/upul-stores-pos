"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import {
  supplierSchema,
  supplierPaymentSchema,
  type SupplierFormValues,
  type SupplierPaymentValues,
} from "../schemas/supplier-schema";

export async function getSuppliers() {
  return prisma.supplier.findMany({
    include: {
      _count: { select: { products: true, purchases: true } },
    },
    orderBy: { name: "asc" },
  });
}

export async function getSupplierById(id: string) {
  return prisma.supplier.findUnique({
    where: { id },
    include: {
      products: {
        select: { id: true, name: true, sku: true, sellingPrice: true, quantity: true },
        take: 10,
        orderBy: { name: "asc" },
      },
      purchases: {
        select: {
          id: true,
          purchaseNumber: true,
          total: true,
          status: true,
          paymentStatus: true,
          createdAt: true,
        },
        take: 10,
        orderBy: { createdAt: "desc" },
      },
      supplierPayments: {
        select: {
          id: true,
          amount: true,
          method: true,
          reference: true,
          notes: true,
          paidAt: true,
        },
        take: 10,
        orderBy: { paidAt: "desc" },
      },
      _count: { select: { products: true, purchases: true } },
    },
  });
}

export async function createSupplierAction(input: SupplierFormValues) {
  const validated = supplierSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0]?.message ?? "Invalid data" };
  }

  const data = validated.data;

  try {
    const supplier = await prisma.supplier.create({
      data: {
        name: data.name.trim(),
        email: data.email?.trim() || null,
        phone: data.phone.trim(),
        address: data.address?.trim() || null,
        company: data.company?.trim() || null,
        taxNumber: data.taxNumber?.trim() || null,
        isActive: data.isActive,
      },
    });

    revalidatePath("/suppliers");
    return { success: true, message: "Supplier created.", supplierId: supplier.id };
  } catch {
    return { success: false, error: "Failed to create supplier." };
  }
}

export async function updateSupplierAction(id: string, input: SupplierFormValues) {
  const validated = supplierSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0]?.message ?? "Invalid data" };
  }

  const data = validated.data;

  try {
    const existing = await prisma.supplier.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Supplier not found." };

    await prisma.supplier.update({
      where: { id },
      data: {
        name: data.name.trim(),
        email: data.email?.trim() || null,
        phone: data.phone.trim(),
        address: data.address?.trim() || null,
        company: data.company?.trim() || null,
        taxNumber: data.taxNumber?.trim() || null,
        isActive: data.isActive,
      },
    });

    revalidatePath("/suppliers");
    revalidatePath(`/suppliers/${id}`);
    return { success: true, message: "Supplier updated." };
  } catch {
    return { success: false, error: "Failed to update supplier." };
  }
}

export async function deleteSupplierAction(id: string) {
  try {
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: { _count: { select: { products: true, purchases: true } } },
    });

    if (!supplier) return { success: false, error: "Supplier not found." };

    if (supplier._count.products > 0 || supplier._count.purchases > 0) {
      return {
        success: false,
        error: "Cannot delete: supplier has products or purchases linked.",
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.supplierPayment.deleteMany({ where: { supplierId: id } });
      await tx.supplier.delete({ where: { id } });
    });

    revalidatePath("/suppliers");
    return { success: true, message: `"${supplier.name}" deleted.` };
  } catch {
    return { success: false, error: "Failed to delete supplier." };
  }
}

export async function addSupplierPaymentAction(input: SupplierPaymentValues) {
  const validated = supplierPaymentSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0]?.message ?? "Invalid data" };
  }

  const data = validated.data;

  try {
    const supplier = await prisma.supplier.findUnique({
      where: { id: data.supplierId },
    });

    if (!supplier) return { success: false, error: "Supplier not found." };

    await prisma.$transaction(async (tx) => {
      await tx.supplierPayment.create({
        data: {
          supplierId: data.supplierId,
          amount: data.amount,
          method: data.method,
          reference: data.reference?.trim() || null,
          notes: data.notes?.trim() || null,
        },
      });

      await tx.supplier.update({
        where: { id: data.supplierId },
        data: {
          balance: { decrement: data.amount },
        },
      });
    });

    revalidatePath(`/suppliers/${data.supplierId}`);
    revalidatePath("/suppliers");
    return { success: true, message: `Payment of Rs.${data.amount} recorded.` };
  } catch {
    return { success: false, error: "Failed to record payment." };
  }
}