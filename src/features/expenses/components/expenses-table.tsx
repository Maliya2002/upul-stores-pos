"use client";

import { DataTable } from "@/components/tables";
import { getExpenseColumns, type ExpenseRow } from "./expense-columns";

export function ExpensesTable({ data }: { data: ExpenseRow[] }) {
  return (
    <DataTable
      columns={getExpenseColumns()}
      data={data}
      searchKey="title"
      searchPlaceholder="Search expenses..."
      filterColumn="category"
      filterOptions={[
        { label: "Salary", value: "SALARY" },
        { label: "Electricity", value: "ELECTRICITY" },
        { label: "Rent", value: "RENT" },
        { label: "Transport", value: "TRANSPORT" },
        { label: "Internet", value: "INTERNET" },
        { label: "Other", value: "OTHER" },
      ]}
    />
  );
}