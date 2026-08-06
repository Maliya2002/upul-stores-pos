"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Eye, Pencil } from "lucide-react";
import { StatusBadge, CurrencyDisplay } from "@/components/ui-custom";
import { DeleteSupplierButton } from "./delete-supplier-button";

export type SupplierRow = {
  id: string;
  name: string;
  phone: string;
  company: string;
  balance: number;
  products: number;
  purchases: number;
  isActive: boolean;
};

export function getSupplierColumns(): ColumnDef<SupplierRow, unknown>[] {
  return [
    {
      accessorKey: "name",
      header: "Supplier",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.company || "-"}</p>
        </div>
      ),
    },
    { accessorKey: "phone", header: "Phone" },
    {
      accessorKey: "balance",
      header: "Balance",
      cell: ({ row }) => (
        <CurrencyDisplay
          amount={row.original.balance}
          className={row.original.balance > 0 ? "text-red-500" : "text-emerald-500"}
        />
      ),
    },
    { accessorKey: "products", header: "Products" },
    { accessorKey: "purchases", header: "Purchases" },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge status={row.original.isActive ? "active" : "inactive"} />
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Link
            href={`/suppliers/${row.original.id}`}
            className="inline-flex h-8 items-center rounded-md border px-3 text-sm hover:bg-accent"
          >
            <Eye className="mr-1 h-3.5 w-3.5" />
            View
          </Link>
          <DeleteSupplierButton
            supplierId={row.original.id}
            supplierName={row.original.name}
          />
        </div>
      ),
    },
  ];
}