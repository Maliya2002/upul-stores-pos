"use server";

import { requireStaff } from "@/lib/authorization";

import prisma from "@/lib/prisma";

export async function getEmployees() {
  await requireStaff(["OWNER", "ADMIN", "MANAGER"]);
  return prisma.user.findMany({
    omit: { password: true },
    include: {
      _count: { select: { orders: true, attendances: true } },
    },
    orderBy: { name: "asc" },
  });
}

export async function getEmployeeById(id: string) {
  await requireStaff(["OWNER", "ADMIN", "MANAGER"]);
  return prisma.user.findUnique({
    omit: { password: true },
    where: { id },
    include: {
      attendances: { take: 30, orderBy: { date: "desc" } },
      salaries: { take: 12, orderBy: [{ year: "desc" }, { month: "desc" }] },
      leaves: { take: 10, orderBy: { createdAt: "desc" } },
      _count: { select: { orders: true, attendances: true } },
    },
  });
}
