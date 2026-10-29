import { createHash } from "node:crypto";
import { CheckoutError } from "@/features/pos/utils/checkout";

export class RequestConflict extends CheckoutError {}

export function validateRequestKey(key: string) {
  if (
    typeof key !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      key,
    )
  )
    throw new CheckoutError(
      "A valid transaction reference is required. Reload the POS.",
    );
}

export function fingerprint(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

export function verifyReplay(stored: string | null, requested: string) {
  if (stored !== requested)
    throw new RequestConflict(
      "This transaction reference belongs to a different request. Ask a manager to reconcile it before starting another transaction.",
    );
}
