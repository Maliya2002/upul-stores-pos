"use client";

import { DataTable } from "@/components/tables";
import { getSupplierColumns, type SupplierRow } from "./supplier-columns";

interface SuppliersTableProps {
  data: SupplierRow[];
}

export function SuppliersTable({ data }: SuppliersTableProps) {
  const columns = getSupplierColumns();

  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="name"
      searchPlaceholder="Search suppliers..."
    />
  );
}