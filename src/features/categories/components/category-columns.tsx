"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { StatusBadge } from "@/components/ui-custom";
import { DeleteCategoryButton } from "./delete-category-button";

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  parent: string;
  products: number;
  children: number;
  isActive: boolean;
};

export function getCategoryColumns(): ColumnDef<CategoryRow, unknown>[] {
  return [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "slug", header: "Slug" },
    { accessorKey: "parent", header: "Parent" },
    { accessorKey: "products", header: "Products" },
    { accessorKey: "children", header: "Sub-categories" },
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
            href={`/categories/${row.original.id}`}
            className="inline-flex h-8 items-center rounded-md border px-3 text-sm hover:bg-accent"
          >
            <Pencil className="mr-1 h-3.5 w-3.5" />
            Edit
          </Link>
          <DeleteCategoryButton
            categoryId={row.original.id}
            categoryName={row.original.name}
          />
        </div>
      ),
    },
  ];
}