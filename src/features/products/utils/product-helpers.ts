import { slugify } from "@/lib/utils";

export function buildProductSlug(name: string): string {
  const slug = slugify(name);
  return slug || `product-${Date.now()}`;
}

export function normalizeOptionalString(value?: string | null): string | null {
  const trimmed = (value ?? "").trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function getStockState(
  quantity: number,
  minimumStock: number
): "in_stock" | "low_stock" | "out_of_stock" {
  if (quantity === 0) return "out_of_stock";
  if (quantity <= minimumStock) return "low_stock";
  return "in_stock";
}

export function getBarcodeValue(
  barcode?: string | null,
  sku?: string | null,
  id?: string | null
): string {
  return barcode?.trim() || sku?.trim() || id?.trim() || "N/A";
}

export function formatDateForInput(date?: Date | string | null): string {
  if (!date) return "";
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return "";
  return value.toISOString().split("T")[0];
}