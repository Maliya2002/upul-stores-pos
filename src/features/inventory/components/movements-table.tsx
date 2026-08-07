"use client";

import { DataTable } from "@/components/tables";
import { getMovementColumns, type MovementRow } from "./movement-columns";

interface MovementsTableProps {
  data: MovementRow[];
}

export function MovementsTable({ data }: MovementsTableProps) {
  return (
    <DataTable
      columns={getMovementColumns()}
      data={data}
      searchKey="product"
      searchPlaceholder="Search movements..."
      filterColumn="type"
      filterOptions={[
        { label: "Purchase", value: "PURCHASE" },
        { label: "Sale", value: "SALE" },
        { label: "Adjustment", value: "ADJUSTMENT" },
        { label: "Damaged", value: "DAMAGED" },
        { label: "Expired", value: "EXPIRED" },
        { label: "Return", value: "RETURN" },
      ]}
    />
  );
}