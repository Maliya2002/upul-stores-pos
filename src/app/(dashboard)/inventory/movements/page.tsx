import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui-custom";
import {
  MovementsTable,
  type MovementRow,
} from "@/features/inventory/components";
import { getStockMovements } from "@/features/inventory/actions/inventory-actions";
import { formatDateTime } from "@/lib/utils";

export default async function MovementsPage() {
  const movements = await getStockMovements({ limit: 200 });

  const rows: MovementRow[] = movements.map(
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock Movements"
        badge={`${rows.length}`}
        description="Complete history of all stock movements."
      />
      <Card>
        <CardContent className="p-5">
          <MovementsTable data={rows} />
        </CardContent>
      </Card>
    </div>
  );
}