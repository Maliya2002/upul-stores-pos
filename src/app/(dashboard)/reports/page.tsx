import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader, PrintButton } from "@/components/ui-custom";
import { ExportButton } from "@/components/ui-custom";
import {
  ReportCards,
  SalesChart,
  ExpenseChart,
  ProfitChart,
  TopProductsChart,
} from "@/features/reports/components";
import { getDashboardReport } from "@/features/reports/actions/report-actions";
import { formatCurrency } from "@/lib/utils";
import { StatusBadge } from "@/components/ui-custom";

export default async function ReportsPage() {
  const report = await getDashboardReport();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics"
        description="Comprehensive business insights and performance metrics."
        actions={
          <>
            <PrintButton />
            <ExportButton
              data={report.topProducts}
              filename="top-products-report"
            />
          </>
        }
      />

      <div className="rounded-lg border p-4 text-sm space-y-2">
        <p>
          Periods use Asia/Colombo. Net receipts include tax and invoice
          discounts; refunds reduce the period when the return was recorded.
          Expenses use their paid date.
        </p>
        <p>
          Estimated profit excludes tax allocated using each line�s saved tax
          rate, historical item costs and recorded expenses. Only restocked
          returns reverse item cost. This estimate depends on complete expense
          and cost records.
        </p>
        {report.month.incomplete > 0 && (
          <p role="status" className="font-medium text-amber-600">
            Monthly profit unavailable: {report.month.incomplete} sale or return
            records have missing historical details. Current product costs are
            never substituted.
          </p>
        )}
      </div>

      {/* Stats Cards */}
      <ReportCards
        todayRevenue={report.today.revenue}
        todayOrders={report.today.orders}
        monthRevenue={report.month.revenue}
        monthProfit={report.month.profit}
        monthExpenses={report.month.expenses}
        totalProducts={report.totals.products}
        totalCustomers={report.totals.customers}
        lowStock={report.totals.lowStock}
      />

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="card-hover">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground">
              Net Receipts � Last 7 Days
            </p>
            <p className="text-xl font-black mt-1">
              {formatCurrency(report.week.revenue)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {report.week.orders} orders
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground">
              Year-to-date Net Receipts
            </p>
            <p className="text-xl font-black mt-1">
              {formatCurrency(report.year.revenue)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {report.year.orders} orders
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground">Total Expenses</p>
            <p className="text-xl font-black text-red-500 mt-1">
              {formatCurrency(report.totals.expenses)}
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground">Suppliers</p>
            <p className="text-xl font-black mt-1">{report.totals.suppliers}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {report.totals.outOfStock} out of stock
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 xl:grid-cols-2">
        <SalesChart data={report.monthlySales} />
        <ProfitChart data={report.monthlySales} />
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 xl:grid-cols-2">
        <TopProductsChart data={report.topProducts} />
        <ExpenseChart data={report.expenseByCategory} />
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {report.recentOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No orders yet.
            </p>
          ) : (
            <div className="space-y-3">
              {report.recentOrders.map(
                (order: (typeof report.recentOrders)[number]) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between rounded-xl border p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-bold">#{order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.customer} ·{" "}
                        {new Date(order.date).toLocaleString("en-LK", {
                          timeZone: "Asia/Colombo",
                        })}
                      </p>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <StatusBadge status={order.status} />
                      <span className="font-bold text-sm">
                        {formatCurrency(order.total)}
                      </span>
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
