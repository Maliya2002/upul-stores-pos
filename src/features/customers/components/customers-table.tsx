"use client";

import { DataTable } from "@/components/tables";
import { getCustomerColumns, type CustomerRow } from "./customer-columns";

interface CustomersTableProps {
  data: CustomerRow[];
}

export function CustomersTable({ data }: CustomersTableProps) {
  const columns = getCustomerColumns();

  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="name"
      searchPlaceholder="Search customers..."
      filterColumn="membershipLevel"
      filterOptions={[
        { label: "Bronze", value: "BRONZE" },
        { label: "Silver", value: "SILVER" },
        { label: "Gold", value: "GOLD" },
        { label: "Platinum", value: "PLATINUM" },
      ]}
    />
  );
}