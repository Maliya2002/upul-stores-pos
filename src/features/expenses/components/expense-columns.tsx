"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { CurrencyDisplay } from "@/components/ui-custom";
import { Badge } from "@/components/ui/badge";

export type ExpenseRow = {
  id: string;
  title: string;
  amount: number;
  category: string;
  createdAt: string;
};

const categoryEmoji: Record<string, string> = {
  SALARY: "💰", ELECTRICITY: "⚡", TRANSPORT: "🚗", RENT: "🏠",
  INTERNET: "🌐", MAINTENANCE: "🔧", MARKETING: "📢", OTHER: "📋",
};

export function getExpenseColumns(): ColumnDef<ExpenseRow, unknown>[] {
  return [
    { accessorKey: "title", header: "Title", cell: ({ row }) => <span className="font-semibold">{row.original.title}</span> },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <Badge variant="outline" className="text-xs">
          {categoryEmoji[row.original.category] ?? "📋"} {row.original.category}
        </Badge>
      ),
    },
    { accessorKey: "amount", header: "Amount", cell: ({ row }) => <CurrencyDisplay amount={row.original.amount} className="font-bold text-red-500" /> },
    { accessorKey: "createdAt", header: "Date", cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.createdAt}</span> },
  ];
}