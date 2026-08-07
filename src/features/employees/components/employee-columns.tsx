"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Eye } from "lucide-react";
import { StatusBadge } from "@/components/ui-custom";
import { Badge } from "@/components/ui/badge";

export type EmployeeRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  orders: number;
  isActive: boolean;
};

export function getEmployeeColumns(): ColumnDef<EmployeeRow, unknown>[] {
  return [
    {
      accessorKey: "name",
      header: "Employee",
      cell: ({ row }) => (
        <div>
          <p className="font-semibold">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.email}</p>
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => <Badge variant="outline" className="text-xs">{row.original.role}</Badge>,
    },
    { accessorKey: "phone", header: "Phone" },
    { accessorKey: "orders", header: "Sales" },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.isActive ? "active" : "inactive"} />,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Link href={`/employees/${row.original.id}`} className="inline-flex h-8 items-center rounded-md border px-3 text-sm hover:bg-accent">
          <Eye className="mr-1.5 h-3.5 w-3.5" />View
        </Link>
      ),
    },
  ];
}