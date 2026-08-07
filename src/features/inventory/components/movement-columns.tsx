"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";

export type MovementRow = {
  id: string;
  product: string;
  sku: string;
  type: string;
  quantity: number;
  beforeQty: number;
  afterQty: number;
  reference: string;
  notes: string;
  createdAt: string;
};

const typeColors: Record<string, string> = {
  PURCHASE: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  SALE: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  ADJUSTMENT: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  TRANSFER: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
  DAMAGED: "bg-red-500/10 text-red-600 border-red-500/20",
  EXPIRED: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  RETURN: "bg-amber-500/10 text-amber-600 border-amber-500/20",
};

export function getMovementColumns(): ColumnDef<MovementRow, unknown>[] {
  return [
    {
      accessorKey: "product",
      header: "Product",
      cell: ({ row }) => (
        <div>
          <p className="font-semibold">{row.original.product}</p>
          <p className="text-xs text-muted-foreground">
            SKU: {row.original.sku}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={typeColors[row.original.type] ?? ""}
        >
          {row.original.type}
        </Badge>
      ),
    },
    {
      accessorKey: "quantity",
      header: "Qty",
      cell: ({ row }) => (
        <span className="font-bold">{row.original.quantity}</span>
      ),
    },
    {
      id: "change",
      header: "Stock Change",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.beforeQty} → {row.original.afterQty}
        </span>
      ),
    },
    {
      accessorKey: "reference",
      header: "Reference",
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.reference || "-"}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.createdAt}
        </span>
      ),
    },
  ];
}