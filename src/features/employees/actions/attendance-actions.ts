"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

export async function markAttendanceAction(
  userId: string,
  status: "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY" | "LEAVE"
) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.attendance.upsert({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
      update: {
        status,
        checkIn: status === "PRESENT" || status === "LATE" ? new Date() : null,
      },
      create: {
        userId,
        date: today,
        status,
        checkIn: status === "PRESENT" || status === "LATE" ? new Date() : null,
      },
    });

    revalidatePath(`/employees/${userId}`);
    revalidatePath("/employees");
    return { success: true, message: "Attendance marked." };
  } catch {
    return { success: false, error: "Failed to mark attendance." };
  }
}