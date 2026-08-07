"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Eye } from "lucide-react";
import { CurrencyDisplay, StatusBadge } from "@/components/ui-custom";
import { Badge } from "@/components/ui/badge";

export type PurchaseRow = {
  id: string;
  purchaseNumber: string;
  supplier: string;
  items: number;
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
};

export function getPurchaseColumns(): ColumnDef<PurchaseRow, unknown>[] {
  return [
    {
      accessorKey: "purchaseNumber",
      header: "PO #",
      cell: ({ row }) => (
        <span className="font-bold text-primary">
          #{row.original.purchaseNumber}
        </span>
      ),
    },
    { accessorKey: "supplier", header: "Supplier" },
    { accessorKey: "items", header: "Items" },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) => <CurrencyDisplay amount={row.original.total} className="font-bold" />,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "paymentStatus",
      header: "Payment",
      cell: ({ row }) => <StatusBadge status={row.original.paymentStatus} />,
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.createdAt}</span>,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Link
          href={`/purchases/${row.original.id}`}
          className="inline-flex h-8 items-center rounded-md border px-3 text-sm hover:bg-accent"
        >
          <Eye className="mr-1.5 h-3.5 w-3.5" />
          View
        </Link>
      ),
    },
  ];
}