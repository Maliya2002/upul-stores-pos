import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";

// A conflicting checkout/return must re-read both stock and the idempotency record.
export async function serializable<T>(
  work: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await prisma.$transaction(work, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        maxWait: 5000,
        timeout: 15000,
      });
    } catch (error) {
      if (
        attempt >= 2 ||
        !(error instanceof Prisma.PrismaClientKnownRequestError) ||
        !["P2034", "P2002"].includes(error.code)
      )
        throw error;
    }
  }
}
