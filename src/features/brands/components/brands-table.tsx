"use client";

import { DataTable } from "@/components/tables";
import { getBrandColumns, type BrandRow } from "./brand-columns";

interface BrandsTableProps {
  data: BrandRow[];
}

export function BrandsTable({ data }: BrandsTableProps) {
  const columns = getBrandColumns();

  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="name"
      searchPlaceholder="Search brands..."
    />
  );
}