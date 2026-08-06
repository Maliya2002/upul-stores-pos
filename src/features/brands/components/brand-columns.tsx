"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { StatusBadge } from "@/components/ui-custom";
import { DeleteBrandButton } from "./delete-brand-button";

export type BrandRow = {
  id: string;
  name: string;
  slug: string;
  products: number;
  isActive: boolean;
};

export function getBrandColumns(): ColumnDef<BrandRow, unknown>[] {
  return [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "slug", header: "Slug" },
    { accessorKey: "products", header: "Products" },
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
            href={`/brands/${row.original.id}`}
            className="inline-flex h-8 items-center rounded-md border px-3 text-sm hover:bg-accent"
          >
            <Pencil className="mr-1 h-3.5 w-3.5" />
            Edit
          </Link>
          <DeleteBrandButton
            brandId={row.original.id}
            brandName={row.original.name}
          />
        </div>
      ),
    },
  ];
}