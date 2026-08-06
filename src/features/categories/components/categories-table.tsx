"use client";

import { DataTable } from "@/components/tables";
import { getCategoryColumns, type CategoryRow } from "./category-columns";

interface CategoriesTableProps {
  data: CategoryRow[];
}

export function CategoriesTable({ data }: CategoriesTableProps) {
  const columns = getCategoryColumns();

  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="name"
      searchPlaceholder="Search categories..."
    />
  );
}