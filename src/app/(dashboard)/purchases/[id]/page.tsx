import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader, CurrencyDisplay, StatusBadge } from "@/components/ui-custom";
import { getPurchaseById } from "@/features/purchases/actions/purchase-actions";
import { formatDateTime } from "@/lib/utils";

export default async function PurchaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const purchase = await getPurchaseById(id);
  if (!purchase) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Purchase #${purchase.purchaseNumber}`}
        actions={<Link href="/purchases"><Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" />Back</Button></Link>}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Supplier</p><p className="text-lg font-bold mt-1">{purchase.supplier.name}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Total</p><div className="text-2xl font-black mt-1"><CurrencyDisplay amount={purchase.total} /></div></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Status</p><div className="mt-2"><StatusBadge status={purchase.status} /></div></CardContent></Card>
      </div>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Items</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {purchase.items.map((item: (typeof purchase.items)[number]) => (
              <div key={item.id} className="flex items-center justify-between rounded-xl border p-4">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-xs text-muted-foreground">Qty: {item.quantity} × <CurrencyDisplay amount={item.unitCost} /></p>
                </div>
                <p className="font-bold"><CurrencyDisplay amount={item.total} /></p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}