import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui-custom";
import { getCustomers } from "@/features/customers/actions/customer-actions";
import {
  CustomersTable,
  type CustomerRow,
} from "@/features/customers/components";

export default async function CustomersPage() {
  const customers = await getCustomers();

  const rows: CustomerRow[] = customers.map(
    (c: (typeof customers)[number]) => ({
      id: c.id,
      name: c.name,
      phone: c.phone ?? "",
      email: c.email ?? "",
      membershipLevel: c.membershipLevel,
      loyaltyPoints: c.loyaltyPoints,
      creditBalance: c.creditBalance,
      totalOrders: c._count.orders,
      isActive: c.isActive,
    })
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        badge={`${rows.length}`}
        description="Manage customers, loyalty points, membership and purchase history."
        actions={
          <Link href="/customers/add">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          {
            label: "Total Customers",
            value: rows.length,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
          },
          {
            label: "Active",
            value: rows.filter((r) => r.isActive).length,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
          },
          {
            label: "Gold & Platinum",
            value: rows.filter(
              (r) =>
                r.membershipLevel === "GOLD" ||
                r.membershipLevel === "PLATINUM"
            ).length,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
          },
          {
            label: "Total Points",
            value: rows
              .reduce((sum, r) => sum + r.loyaltyPoints, 0)
              .toLocaleString(),
            color: "text-purple-500",
            bg: "bg-purple-500/10",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border bg-card p-5 card-hover"
          >
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className={`mt-1 text-2xl font-black ${stat.color}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="p-5">
          <CustomersTable data={rows} />
        </CardContent>
      </Card>
    </div>
  );
}