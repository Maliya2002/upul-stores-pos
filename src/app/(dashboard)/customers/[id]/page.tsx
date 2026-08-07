import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, ArrowLeft, Star, ShoppingBag, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PageHeader,
  CurrencyDisplay,
  StatusBadge,
} from "@/components/ui-custom";
import { DeleteCustomerButton } from "@/features/customers/components";
import { getCustomerById } from "@/features/customers/actions/customer-actions";
import { formatDateTime, formatCurrency } from "@/lib/utils";

const membershipColors: Record<string, string> = {
  BRONZE: "from-orange-400 to-orange-600",
  SILVER: "from-slate-400 to-slate-600",
  GOLD: "from-amber-400 to-amber-600",
  PLATINUM: "from-purple-400 to-purple-600",
};

const membershipBadgeColors: Record<string, string> = {
  BRONZE: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  SILVER: "bg-slate-500/10 text-slate-500 border-slate-500/20",
  GOLD: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  PLATINUM: "bg-purple-500/10 text-purple-600 border-purple-500/20",
};

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await getCustomerById(id);

  if (!customer) notFound();

  const gradient =
    membershipColors[customer.membershipLevel] ??
    "from-blue-400 to-blue-600";

  return (
    <div className="space-y-6">
      <PageHeader
        title={customer.name}
        description={customer.email ?? customer.phone ?? "Customer Profile"}
        actions={
          <>
            <Link href="/customers">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
            <Link href={`/customers/${customer.id}/edit`}>
              <Button>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </Link>
            <DeleteCustomerButton
              customerId={customer.id}
              customerName={customer.name}
              redirectTo="/customers"
            />
          </>
        }
      />

      {/* Profile Banner */}
      <div
        className={`relative overflow-hidden rounded-2xl bg-linear-to-br ${gradient} p-8 text-white`}
      >
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm text-3xl font-black">
            {customer.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-black">{customer.name}</h2>
            <div className="flex flex-wrap gap-3 mt-2">
              <Badge
                variant="outline"
                className="border-white/30 bg-white/10 text-white"
              >
                <Star className="mr-1 h-3 w-3" />
                {customer.membershipLevel} Member
              </Badge>
              <Badge
                variant="outline"
                className="border-white/30 bg-white/10 text-white"
              >
                {customer.loyaltyPoints.toLocaleString()} Points
              </Badge>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            <div className="text-center">
              <p className="text-white/70 text-xs">Total Spent</p>
              <p className="text-xl font-black">
                {formatCurrency(customer.totalPurchases)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-white/70 text-xs">Total Orders</p>
              <p className="text-xl font-black">{customer._count.orders}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="card-hover">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-purple-500/10 p-3">
                <Star className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Loyalty Points</p>
                <p className="text-2xl font-black text-purple-500">
                  {customer.loyaltyPoints.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-500/10 p-3">
                <CreditCard className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Credit Balance</p>
                <p className="text-2xl font-black text-blue-500">
                  <CurrencyDisplay amount={customer.creditBalance} />
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-500/10 p-3">
                <ShoppingBag className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-black text-emerald-500">
                  {customer._count.orders}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-500/10 p-3">
                <Star className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Membership</p>
                <Badge
                  variant="outline"
                  className={
                    membershipBadgeColors[customer.membershipLevel] ?? ""
                  }
                >
                  ★ {customer.membershipLevel}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {/* Customer Info */}
        <Card className="card-hover">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold">
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <InfoItem label="Phone" value={customer.phone ?? "-"} />
            <InfoItem label="Email" value={customer.email ?? "-"} />
            <InfoItem label="Address" value={customer.address ?? "-"} />
            <InfoItem
              label="Status"
              value={customer.isActive ? "Active" : "Inactive"}
            />
            <InfoItem
              label="Member Since"
              value={formatDateTime(customer.createdAt)}
            />
            <InfoItem
              label="Last Updated"
              value={formatDateTime(customer.updatedAt)}
            />
          </CardContent>
        </Card>

        {/* Purchase History */}
        <Card className="card-hover">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold">
              Purchase History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {customer.orders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No purchases yet.
              </p>
            ) : (
              <div className="space-y-3">
                {customer.orders.map(
                  (order: (typeof customer.orders)[number]) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between gap-3 rounded-xl border p-3 hover:bg-muted/30 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-semibold">
                          #{order.orderNumber}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(order.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">
                          <CurrencyDisplay amount={order.total} />
                        </p>
                        <StatusBadge status={order.orderStatus} />
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">
        {label}
      </p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}