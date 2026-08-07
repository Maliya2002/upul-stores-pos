import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui-custom";
import {
  SalesStats,
  SalesTable,
  type SaleRow,
} from "@/features/sales/components";
import {
  getSales,
  getSalesStats,
} from "@/features/sales/actions/sales-actions";
import { formatDateTime } from "@/lib/utils";

export default async function SalesPage() {
  const [sales, stats] = await Promise.all([
    getSales(),
    getSalesStats(),
  ]);

  const rows: SaleRow[] = sales.map(
    (sale: (typeof sales)[number]) => ({
      id: sale.id,
      orderNumber: sale.orderNumber,
      customer: sale.customer?.name ?? "Walk-in",
      cashier: sale.cashier.name,
      items: sale._count.items,
      total: sale.total,
      paymentMethod: sale.paymentMethod,
      paymentStatus: sale.paymentStatus,
      orderStatus: sale.orderStatus,
      refunds: sale._count.refunds,
      createdAt: formatDateTime(sale.createdAt),
    })
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales"
        badge={`${rows.length} Orders`}
        description="View all sales, invoices and process refunds."
      />

      <SalesStats
        todayRevenue={stats.todayRevenue}
        todayOrders={stats.todayOrders}
        monthRevenue={stats.monthRevenue}
        totalRefundAmount={stats.totalRefundAmount}
      />

      <Card>
        <CardContent className="p-5">
          <SalesTable data={rows} />
        </CardContent>
      </Card>
    </div>
  );
}