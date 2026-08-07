import Link from "next/link";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  RotateCcw,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui-custom";
import {
  StockOverviewCards,
  MovementTimeline,
  LowStockTable,
  type MovementRow,
} from "@/features/inventory/components";
import {
  getInventoryStats,
  getStockMovements,
  getLowStockProducts,
} from "@/features/inventory/actions/inventory-actions";
import { formatDateTime } from "@/lib/utils";

export default async function InventoryPage() {
  const [stats, movements, lowStockProducts] = await Promise.all([
    getInventoryStats(),
    getStockMovements({ limit: 10 }),
    getLowStockProducts(),
  ]);

  const movementRows: MovementRow[] = movements.map(
    (m: (typeof movements)[number]) => ({
      id: m.id,
      product: m.product.name,
      sku: m.product.sku,
      type: m.type,
      quantity: m.quantity,
      beforeQty: m.beforeQty,
      afterQty: m.afterQty,
      reference: m.reference ?? "",
      notes: m.notes ?? "",
      createdAt: formatDateTime(m.createdAt),
    })
  );

  const lowStockItems = lowStockProducts.map(
    (p: (typeof lowStockProducts)[number]) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      quantity: p.quantity,
      minimumStock: p.minimumStock,
      category: p.category.name,
    })
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        description="Manage stock levels, movements and alerts."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link href="/inventory/stock-in">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <ArrowDownToLine className="mr-2 h-4 w-4" />
                Stock In
              </Button>
            </Link>
            <Link href="/inventory/stock-out">
              <Button variant="destructive">
                <ArrowUpFromLine className="mr-2 h-4 w-4" />
                Stock Out
              </Button>
            </Link>
            <Link href="/inventory/movements">
              <Button variant="outline">
                <History className="mr-2 h-4 w-4" />
                All Movements
              </Button>
            </Link>
          </div>
        }
      />

      <StockOverviewCards
        totalProducts={stats.totalProducts}
        totalStock={stats.totalStock}
        lowStockItems={stats.lowStockItems}
        outOfStockItems={stats.outOfStockItems}
        totalMovements={stats.totalMovements}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <MovementTimeline movements={movementRows} />
        <LowStockTable items={lowStockItems} />
      </div>
    </div>
  );
}