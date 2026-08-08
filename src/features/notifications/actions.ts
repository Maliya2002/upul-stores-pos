"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

export async function markNotificationAsRead(id: string) {
  try {
    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
    revalidatePath("/notifications");
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function markAllNotificationsAsRead() {
  try {
    await prisma.notification.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    });
    revalidatePath("/notifications");
    return {
      success: true,
      message: "All notifications marked as read.",
    };
  } catch {
    return { success: false, error: "Failed." };
  }
}

export async function deleteNotification(id: string) {
  try {
    await prisma.notification.delete({ where: { id } });
    revalidatePath("/notifications");
    return { success: true };
  } catch {
    return { success: false };
  }
}