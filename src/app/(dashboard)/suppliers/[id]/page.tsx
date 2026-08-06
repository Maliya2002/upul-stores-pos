import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PageHeader,
  CurrencyDisplay,
  StatusBadge,
} from "@/components/ui-custom";
import { DeleteSupplierButton } from "@/features/suppliers/components";
import { getSupplierById } from "@/features/suppliers/actions/supplier-actions";
import { formatDateTime } from "@/lib/utils";

export default async function SupplierDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supplier = await getSupplierById(id);

  if (!supplier) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={supplier.name}
        badge={supplier.isActive ? "Active" : "Inactive"}
        description={supplier.company ?? undefined}
        actions={
          <>
            <Link href="/suppliers">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
            <Link href={`/suppliers/${supplier.id}/edit`}>
              <Button>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </Link>
            <DeleteSupplierButton
              supplierId={supplier.id}
              supplierName={supplier.name}
              redirectTo="/suppliers"
            />
          </>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Balance Due</p>
            <div className="mt-1 text-2xl font-bold">
              <CurrencyDisplay
                amount={supplier.balance}
                className={supplier.balance > 0 ? "text-red-500" : "text-emerald-500"}
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Products</p>
            <div className="mt-1 text-2xl font-bold">{supplier._count.products}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Purchases</p>
            <div className="mt-1 text-2xl font-bold">{supplier._count.purchases}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total Orders</p>
            <div className="mt-1 text-2xl font-bold">{supplier.totalOrders}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {/* Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Supplier Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <InfoItem label="Phone" value={supplier.phone} />
            <InfoItem label="Email" value={supplier.email ?? "-"} />
            <InfoItem label="Company" value={supplier.company ?? "-"} />
            <InfoItem label="Tax Number" value={supplier.taxNumber ?? "-"} />
            <InfoItem label="Address" value={supplier.address ?? "-"} />
            <InfoItem
              label="Status"
              value={supplier.isActive ? "Active" : "Inactive"}
            />
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            {supplier.supplierPayments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No payments recorded yet.
              </p>
            ) : (
              <div className="space-y-3">
                {supplier.supplierPayments.map(
                  (payment: (typeof supplier.supplierPayments)[number]) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between gap-3 rounded-lg border p-3"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          <CurrencyDisplay amount={payment.amount} />
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {payment.method} · {formatDateTime(payment.paidAt)}
                        </p>
                      </div>
                      <StatusBadge status="completed" />
                    </div>
                  )
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {/* Products */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Linked Products</CardTitle>
          </CardHeader>
          <CardContent>
            {supplier.products.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No products linked.
              </p>
            ) : (
              <div className="space-y-3">
                {supplier.products.map(
                  (product: (typeof supplier.products)[number]) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between gap-3 rounded-lg border p-3"
                    >
                      <div>
                        <p className="text-sm font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          SKU: {product.sku}
                        </p>
                      </div>
                      <div className="text-right">
                        <CurrencyDisplay amount={product.sellingPrice} />
                        <p className="text-xs text-muted-foreground">
                          Stock: {product.quantity}
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Purchases */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Purchases</CardTitle>
          </CardHeader>
          <CardContent>
            {supplier.purchases.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No purchases recorded.
              </p>
            ) : (
              <div className="space-y-3">
                {supplier.purchases.map(
                  (purchase: (typeof supplier.purchases)[number]) => (
                    <div
                      key={purchase.id}
                      className="flex items-center justify-between gap-3 rounded-lg border p-3"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {purchase.purchaseNumber}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(purchase.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <CurrencyDisplay amount={purchase.total} />
                        <div className="mt-1">
                          <StatusBadge status={purchase.status} />
                        </div>
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
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}