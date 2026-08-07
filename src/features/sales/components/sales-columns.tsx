"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Eye } from "lucide-react";
import { CurrencyDisplay, StatusBadge } from "@/components/ui-custom";
import { Badge } from "@/components/ui/badge";

export type SaleRow = {
  id: string;
  orderNumber: string;
  customer: string;
  cashier: string;
  items: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  refunds: number;
  createdAt: string;
};

export function getSaleColumns(): ColumnDef<SaleRow, unknown>[] {
  return [
    {
      accessorKey: "orderNumber",
      header: "Invoice",
      cell: ({ row }) => (
        <span className="font-bold text-primary">
          #{row.original.orderNumber}
        </span>
      ),
    },
    {
      accessorKey: "customer",
      header: "Customer",
    },
    {
      accessorKey: "items",
      header: "Items",
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) => (
        <CurrencyDisplay
          amount={row.original.total}
          className="font-bold"
        />
      ),
    },
    {
      accessorKey: "paymentMethod",
      header: "Payment",
      cell: ({ row }) => (
        <Badge variant="outline" className="text-xs">
          {row.original.paymentMethod}
        </Badge>
      ),
    },
    {
      accessorKey: "orderStatus",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge status={row.original.orderStatus} />
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
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Link
          href={`/sales/${row.original.id}`}
          className="inline-flex h-8 items-center rounded-md border px-3 text-sm font-medium hover:bg-accent"
        >
          <Eye className="mr-1.5 h-3.5 w-3.5" />
          View
        </Link>
      ),
    },
  ];
}