"use client";

import { DataTable } from "@/components/tables";
import { getSaleColumns, type SaleRow } from "./sales-columns";

interface SalesTableProps {
  data: SaleRow[];
}

export function SalesTable({ data }: SalesTableProps) {
  return (
    <DataTable
      columns={getSaleColumns()}
      data={data}
      searchKey="orderNumber"
      searchPlaceholder="Search by invoice #..."
      filterColumn="orderStatus"
      filterOptions={[
        { label: "Completed", value: "COMPLETED" },
        { label: "Pending", value: "PENDING" },
        { label: "Cancelled", value: "CANCELLED" },
        { label: "Refunded", value: "REFUNDED" },
      ]}
    />
  );
}