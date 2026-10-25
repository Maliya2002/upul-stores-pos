"use server";

import { requireStaff } from "@/lib/authorization";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import {
  customerSchema,
  type CustomerFormValues,
} from "../schemas/customer-schema";

export async function getCustomers() {
  await requireStaff(["OWNER", "ADMIN", "MANAGER", "CASHIER"]);
  return prisma.customer.findMany({
    include: {
      _count: { select: { orders: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCustomerById(id: string) {
  await requireStaff(["OWNER", "ADMIN", "MANAGER", "CASHIER"]);
  return prisma.customer.findUnique({
    where: { id },
    include: {
      orders: {
        select: {
          id: true,
          orderNumber: true,
          total: true,
          orderStatus: true,
          paymentStatus: true,
          createdAt: true,
        },
        take: 10,
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { orders: true } },
    },
  });
}

export async function createCustomerAction(input: CustomerFormValues) {
  await requireStaff(["OWNER", "ADMIN", "MANAGER", "CASHIER"]);
  const validated = customerSchema.safeParse(input);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message ?? "Invalid data",
    };
  }

  const data = validated.data;

  try {
    const customer = await prisma.customer.create({
      data: {
        name: data.name.trim(),
        email: data.email?.trim() || null,
        phone: data.phone?.trim() || null,
        address: data.address?.trim() || null,
        membershipLevel: data.membershipLevel,
        loyaltyPoints: data.loyaltyPoints,
        creditBalance: data.creditBalance,
        isActive: data.isActive,
      },
    });

    revalidatePath("/customers");
    return {
      success: true,
      message: "Customer created successfully.",
      customerId: customer.id,
    };
  } catch (error: unknown) {
    if ((error as { code?: string })?.code === "P2002") {
      return { success: false, error: "Email already exists." };
    }
    return { success: false, error: "Failed to create customer." };
  }
}

export async function updateCustomerAction(
  id: string,
  input: CustomerFormValues,
) {
  await requireStaff(["OWNER", "ADMIN", "MANAGER", "CASHIER"]);
  const validated = customerSchema.safeParse(input);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message ?? "Invalid data",
    };
  }

  const data = validated.data;

  try {
    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Customer not found." };

    await prisma.customer.update({
      where: { id },
      data: {
        name: data.name.trim(),
        email: data.email?.trim() || null,
        phone: data.phone?.trim() || null,
        address: data.address?.trim() || null,
        membershipLevel: data.membershipLevel,
        loyaltyPoints: data.loyaltyPoints,
        creditBalance: data.creditBalance,
        isActive: data.isActive,
      },
    });

    revalidatePath("/customers");
    revalidatePath(`/customers/${id}`);
    return { success: true, message: "Customer updated successfully." };
  } catch (error: unknown) {
    if ((error as { code?: string })?.code === "P2002") {
      return { success: false, error: "Email already exists." };
    }
    return { success: false, error: "Failed to update customer." };
  }
}

export async function deleteCustomerAction(id: string) {
  await requireStaff(["OWNER", "ADMIN", "MANAGER", "CASHIER"]);
  try {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: { _count: { select: { orders: true } } },
    });

    if (!customer) return { success: false, error: "Customer not found." };

    if (customer._count.orders > 0) {
      return {
        success: false,
        error: "Cannot delete: customer has purchase history.",
      };
    }

    await prisma.customer.delete({ where: { id } });
    revalidatePath("/customers");
    return { success: true, message: `"${customer.name}" deleted.` };
  } catch {
    return { success: false, error: "Failed to delete customer." };
  }
}

export async function addLoyaltyPointsAction(
  customerId: string,
  points: number,
) {
  await requireStaff(["OWNER", "ADMIN", "MANAGER", "CASHIER"]);
  if (!Number.isSafeInteger(points) || points <= 0) {
    return { success: false, error: "Points must be a positive whole number." };
  }
  try {
    await prisma.customer.update({
      where: { id: customerId },
      data: { loyaltyPoints: { increment: points } },
    });

    revalidatePath(`/customers/${customerId}`);
    return { success: true, message: `${points} points added.` };
  } catch {
    return { success: false, error: "Failed to add points." };
  }
}
