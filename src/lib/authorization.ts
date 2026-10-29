import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import type { Role } from "@prisma/client";

export async function requireStaff(roles?: readonly Role[]) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Please sign in to continue.");
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, isActive: true },
  });
  if (!user?.isActive || (roles && !roles.includes(user.role))) {
    throw new Error("You do not have permission to perform this action.");
  }
  return user;
}
