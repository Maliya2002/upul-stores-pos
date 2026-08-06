"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Eye, Pencil } from "lucide-react";
import { CurrencyDisplay, StatusBadge } from "@/components/ui-custom";
import { DeleteProductButton } from "./delete-product-button";

export type ProductTableRow = {
  id: string;
  name: string;
  sku: string;
  barcode: string | null;
  category: string;
  brand: string;
  supplier: string;
  price: number;
  quantity: number;
  minimumStock: number;
  stockStatus: string;
  status: string;
};

export function getProductTableColumns(): ColumnDef<ProductTableRow, unknown>[] {
  return [
    {
      accessorKey: "name",
      header: "Product",
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <p className="font-medium">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">
            SKU: {row.original.sku}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
    },
    {
      accessorKey: "brand",
      header: "Brand",
    },
    {
      accessorKey: "price",
      header: "Selling Price",
      cell: ({ row }) => <CurrencyDisplay amount={row.original.price} />,
    },
    {
      accessorKey: "quantity",
      header: "Stock",
      cell: ({ row }) => (
        <div className="space-y-1">
          <p className="font-medium">{row.original.quantity}</p>
          <StatusBadge status={row.original.stockStatus} />
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/products/${row.original.id}`}
            className="inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm font-medium hover:bg-accent"
          >
            <Eye className="mr-2 h-4 w-4" />
            View
          </Link>

          <Link
            href={`/products/${row.original.id}/edit`}
            className="inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm font-medium hover:bg-accent"
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Link>

          <DeleteProductButton
            productId={row.original.id}
            productName={row.original.name}
          />
        </div>
      ),
    },
  ];
}