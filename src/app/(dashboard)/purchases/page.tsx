import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui-custom";
import { getPurchases } from "@/features/purchases/actions/purchase-actions";
import { PurchasesTable, type PurchaseRow } from "@/features/purchases/components";
import { formatDateTime } from "@/lib/utils";

export default async function PurchasesPage() {
  const purchases = await getPurchases();

  const rows: PurchaseRow[] = purchases.map((p: (typeof purchases)[number]) => ({
    id: p.id,
    purchaseNumber: p.purchaseNumber,
    supplier: p.supplier.name,
    items: p._count.items,
    total: p.total,
    status: p.status,
    paymentStatus: p.paymentStatus,
    createdAt: formatDateTime(p.createdAt),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchases"
        badge={`${rows.length}`}
        description="Manage purchase orders from suppliers."
        actions={
          <Link href="/purchases/add">
            <Button><Plus className="mr-2 h-4 w-4" />New Purchase</Button>
          </Link>
        }
      />
      <Card><CardContent className="p-5"><PurchasesTable data={rows} /></CardContent></Card>
    </div>
  );
}