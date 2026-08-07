"use client";

import { DataTable } from "@/components/tables";
import { getPurchaseColumns, type PurchaseRow } from "./purchase-columns";

export function PurchasesTable({ data }: { data: PurchaseRow[] }) {
  return (
    <DataTable
      columns={getPurchaseColumns()}
      data={data}
      searchKey="purchaseNumber"
      searchPlaceholder="Search PO #..."
      filterColumn="status"
      filterOptions={[
        { label: "Received", value: "RECEIVED" },
        { label: "Pending", value: "PENDING" },
        { label: "Cancelled", value: "CANCELLED" },
      ]}
    />
  );
}