"use server";

import prisma from "@/lib/prisma";

export async function getEmployees() {
  return prisma.user.findMany({
    include: {
      _count: { select: { orders: true, attendances: true } },
    },
    orderBy: { name: "asc" },
  });
}

export async function getEmployeeById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      attendances: { take: 30, orderBy: { date: "desc" } },
      salaries: { take: 12, orderBy: [{ year: "desc" }, { month: "desc" }] },
      leaves: { take: 10, orderBy: { createdAt: "desc" } },
      _count: { select: { orders: true, attendances: true } },
    },
  });
}