"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Eye } from "lucide-react";
import { StatusBadge, CurrencyDisplay } from "@/components/ui-custom";
import { Badge } from "@/components/ui/badge";
import { DeleteCustomerButton } from "./delete-customer-button";

export type CustomerRow = {
  id: string;
  name: string;
  phone: string;
  email: string;
  membershipLevel: string;
  loyaltyPoints: number;
  creditBalance: number;
  totalOrders: number;
  isActive: boolean;
};

const membershipColors: Record<string, string> = {
  BRONZE: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  SILVER: "bg-slate-500/10 text-slate-500 border-slate-500/20",
  GOLD: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  PLATINUM: "bg-purple-500/10 text-purple-600 border-purple-500/20",
};

export function getCustomerColumns(): ColumnDef<CustomerRow, unknown>[] {
  return [
    {
      accessorKey: "name",
      header: "Customer",
      cell: ({ row }) => (
        <div>
          <p className="font-semibold">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">
            {row.original.phone || row.original.email || "-"}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "membershipLevel",
      header: "Membership",
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={
            membershipColors[row.original.membershipLevel] ?? ""
          }
        >
          ★ {row.original.membershipLevel}
        </Badge>
      ),
    },
    {
      accessorKey: "loyaltyPoints",
      header: "Points",
      cell: ({ row }) => (
        <span className="font-semibold text-primary">
          {row.original.loyaltyPoints.toLocaleString()} pts
        </span>
      ),
    },
    {
      accessorKey: "creditBalance",
      header: "Credit",
      cell: ({ row }) => (
        <CurrencyDisplay amount={row.original.creditBalance} />
      ),
    },
    {
      accessorKey: "totalOrders",
      header: "Orders",
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge
          status={row.original.isActive ? "active" : "inactive"}
        />
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Link
            href={`/customers/${row.original.id}`}
            className="inline-flex h-8 items-center rounded-md border px-3 text-sm hover:bg-accent"
          >
            <Eye className="mr-1 h-3.5 w-3.5" />
            View
          </Link>
          <DeleteCustomerButton
            customerId={row.original.id}
            customerName={row.original.name}
          />
        </div>
      ),
    },
  ];
}