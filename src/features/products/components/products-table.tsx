"use client";

import { DataTable } from "@/components/tables";
import {
  getProductTableColumns,
  type ProductTableRow,
} from "./product-table-columns";

interface ProductsTableProps {
  data: ProductTableRow[];
}

export function ProductsTable({ data }: ProductsTableProps) {
  const columns = getProductTableColumns();

  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="name"
      searchPlaceholder="Search products..."
      filterColumn="status"
      filterOptions={[
        { label: "Active", value: "ACTIVE" },
        { label: "Inactive", value: "INACTIVE" },
        { label: "Discontinued", value: "DISCONTINUED" },
      ]}
    />
  );
}