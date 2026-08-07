"use client";

import { DataTable } from "@/components/tables";
import { getEmployeeColumns, type EmployeeRow } from "./employee-columns";

export function EmployeesTable({ data }: { data: EmployeeRow[] }) {
  return <DataTable columns={getEmployeeColumns()} data={data} searchKey="name" searchPlaceholder="Search employees..." />;
}