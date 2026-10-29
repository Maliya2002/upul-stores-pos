"use server";

import { requireStaff } from "@/lib/authorization";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { serializable } from "@/lib/transaction";
import { fingerprint, verifyReplay, RequestConflict } from "@/lib/idempotency";
import { CheckoutError, money } from "@/features/pos/utils/checkout";
import {
  supplierSchema,
  supplierPaymentSchema,
  type SupplierFormValues,
  type SupplierPaymentValues,
} from "../schemas/supplier-schema";

export async function getSuppliers() {
  await requireStaff();
  return prisma.supplier.findMany({
    include: {
      _count: { select: { products: true, purchases: true } },
    },
    orderBy: { name: "asc" },
  });
}

export async function getSupplierById(id: string) {
  await requireStaff();
  return prisma.supplier.findUnique({
    where: { id },
    include: {
      products: {
        select: {
          id: true,
          name: true,
          sku: true,
          sellingPrice: true,
          quantity: true,
        },
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
  await requireStaff(["OWNER", "ADMIN", "MANAGER"]);
  const validated = supplierSchema.safeParse(input);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message ?? "Invalid data",
    };
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
    return {
      success: true,
      message: "Supplier created.",
      supplierId: supplier.id,
    };
  } catch {
    return { success: false, error: "Failed to create supplier." };
  }
}

export async function updateSupplierAction(
  id: string,
  input: SupplierFormValues,
) {
  await requireStaff(["OWNER", "ADMIN", "MANAGER"]);
  const validated = supplierSchema.safeParse(input);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message ?? "Invalid data",
    };
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
  await requireStaff(["OWNER", "ADMIN", "MANAGER"]);
  try {
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: { _count: { select: { products: true, purchases: true } } },
    });

    if (!supplier) return { success: false, error: "Supplier not found." };

    const hasPayments = await prisma.supplierPayment.count({ where: { supplierId: id } });
    if (supplier._count.products > 0 || supplier._count.purchases > 0 || hasPayments > 0 || supplier.balance !== 0) {
      return {
        success: false,
        error: "Cannot delete: supplier has products, purchases, payment history or a balance.",
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
  const staff = await requireStaff(["OWNER", "ADMIN", "MANAGER"]);
  const validated = supplierPaymentSchema.safeParse(input);
  if (!validated.success)
    return {
      success: false,
      retryable: false,
      error: validated.error.issues[0]?.message ?? "Invalid payment",
    };
  const data = validated.data;
  try {
    const hash = fingerprint({ ...data, staff: staff.id });
    const payment = await serializable(async (tx) => {
      const replay = await tx.supplierPayment.findUnique({
        where: { requestKey: data.requestKey },
      });
      if (replay) {
        verifyReplay(replay.requestHash, hash);
        return replay;
      }
      const purchase = await tx.purchase.findUnique({
        where: { id: data.purchaseId },
      });
      if (
        !purchase ||
        purchase.supplierId !== data.supplierId ||
        purchase.status !== "RECEIVED"
      )
        throw new CheckoutError(
          "Choose a received purchase for this supplier.",
        );
      const supplier = await tx.supplier.findUniqueOrThrow({
        where: { id: data.supplierId },
      });
      const remaining = money(purchase.total - purchase.paidAmount);
      if (data.amount > remaining)
        throw new CheckoutError(
          "Payment exceeds this purchase's outstanding amount.",
        );
      if (money(supplier.balance) < data.amount)
        throw new CheckoutError(
          "Supplier balance needs reconciliation before payment.",
        );
      const paid = money(purchase.paidAmount + data.amount);
      await tx.purchase.update({
        where: { id: purchase.id },
        data: {
          paidAmount: paid,
          paymentStatus: paid === purchase.total ? "PAID" : "PARTIAL",
        },
      });
      await tx.supplier.update({
        where: { id: supplier.id },
        data: { balance: money(supplier.balance - data.amount) },
      });
      const entry = await tx.supplierPayment.create({
        data: { ...data, requestHash: hash },
      });
      await tx.auditLog.create({
        data: {
          userId: staff.id,
          action: "SUPPLIER_PAYMENT",
          entity: "SupplierPayment",
          entityId: entry.id,
          newValues: JSON.stringify({
            purchaseId: purchase.id,
            amount: data.amount,
            method: data.method,
          }),
        },
      });
      return entry;
    });
    revalidatePath(`/purchases/${data.purchaseId}`);
    revalidatePath("/purchases");
    revalidatePath(`/suppliers/${data.supplierId}`);
    revalidatePath("/suppliers");
    return {
      success: true,
      retryable: false,
      paymentId: payment.id,
      message: "Supplier payment recorded.",
    };
  } catch (error) {
    return {
      success: false,
      retryable:
        error instanceof RequestConflict || !(error instanceof CheckoutError),
      error:
        error instanceof CheckoutError
          ? error.message
          : "Outcome unconfirmed. Retry the same payment.",
    };
  }
}
