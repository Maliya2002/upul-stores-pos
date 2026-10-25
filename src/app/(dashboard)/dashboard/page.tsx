import Link from "next/link";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { requireStaff } from "@/lib/authorization";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SalesOverviewChart } from "@/components/charts";
import { money } from "@/features/pos/utils/checkout";

const dayKey = (date: Date) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Colombo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

export default async function DashboardPage() {
  const staff = await requireStaff();
  if (staff.role === "CASHIER") redirect("/pos");
  if (staff.role === "INVENTORY_STAFF") redirect("/inventory");
  const today = dayKey(new Date());
  const start = new Date(today + "T00:00:00+05:30");
  start.setUTCDate(start.getUTCDate() - 6);
  const [orders, productCount, customerCount, lowStock, recent] =
    await Promise.all([
      prisma.order.findMany({
        where: {
          createdAt: { gte: start },
          orderStatus: { in: ["COMPLETED", "REFUNDED"] },
        },
        select: {
          createdAt: true,
          total: true,
          refunds: { select: { amount: true } },
        },
      }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.customer.count({ where: { isActive: true } }),
      prisma.product.findMany({
        where: {
          isActive: true,
          quantity: { lte: prisma.product.fields.minimumStock },
        },
        select: { id: true, name: true, quantity: true, minimumStock: true },
        orderBy: { quantity: "asc" },
        take: 8,
      }),
      prisma.order.findMany({
        where: { orderStatus: { in: ["COMPLETED", "REFUNDED"] } },
        include: {
          customer: { select: { name: true } },
          refunds: { select: { amount: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
    ]);
  const chart = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(date.getUTCDate() + index);
    const key = dayKey(date);
    const daily = orders.filter((order) => dayKey(order.createdAt) === key);
    return {
      name: new Intl.DateTimeFormat("en", {
        timeZone: "Asia/Colombo",
        weekday: "short",
      }).format(date),
      orders: daily.length,
      sales: money(
        daily.reduce(
          (sum, order) =>
            sum +
            order.total -
            order.refunds.reduce((total, refund) => total + refund.amount, 0),
          0,
        ),
      ),
    };
  });
  const todayStats = chart[6];
  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-linear-to-br from-blue-600 to-purple-700 p-8 text-white">
        <p className="text-sm text-blue-100">Upul Stores · {today}</p>
        <h1 className="mt-2 text-3xl font-bold">Your store at a glance</h1>
        <p className="mt-2 text-blue-100">
          Live sales and inventory. Sales amounts include refunds against those
          invoices.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            className="rounded-xl bg-white px-5 py-3 font-semibold text-blue-700"
            href="/pos"
          >
            New sale
          </Link>
          <Link
            className="rounded-xl border border-white/40 px-5 py-3 font-semibold"
            href="/products/add"
          >
            Add product
          </Link>
          <Link
            className="rounded-xl border border-white/40 px-5 py-3 font-semibold"
            href="/reports"
          >
            View reports
          </Link>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Today's net sales",
            value: formatCurrency(todayStats.sales),
          },
          { label: "Today's orders", value: todayStats.orders },
          { label: "Active products", value: productCount },
          { label: "Active customers", value: customerCount },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="mt-2 text-3xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <SalesOverviewChart data={chart} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent sales</CardTitle>
          </CardHeader>
          <CardContent>
            {recent.length === 0 ? (
              <p className="text-muted-foreground">
                No sales yet. Complete a sale at the POS to see it here.
              </p>
            ) : (
              <ul className="divide-y">
                {recent.map((order) => (
                  <li key={order.id}>
                    <Link
                      href={"/sales/" + order.id}
                      className="flex items-center justify-between gap-4 py-3 hover:text-primary"
                    >
                      <div>
                        <p className="font-medium">{order.orderNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.customer?.name ?? "Walk-in customer"} ·{" "}
                          {order.orderStatus}
                        </p>
                      </div>
                      <span className="font-semibold">
                        {formatCurrency(
                          money(
                            order.total -
                              order.refunds.reduce(
                                (sum, refund) => sum + refund.amount,
                                0,
                              ),
                          ),
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Low stock</CardTitle>
          </CardHeader>
          <CardContent>
            {lowStock.length === 0 ? (
              <p className="text-muted-foreground">No low-stock products.</p>
            ) : (
              <ul className="divide-y">
                {lowStock.map((product) => (
                  <li key={product.id}>
                    <Link
                      href={"/products/" + product.id}
                      className="flex justify-between gap-4 py-3 hover:text-primary"
                    >
                      <span>{product.name}</span>
                      <span className="text-sm text-amber-600">
                        {product.quantity} left · minimum {product.minimumStock}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href="/inventory"
              className="mt-4 inline-block text-sm font-medium text-primary"
            >
              View inventory →
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
