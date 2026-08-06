import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PageHeader,
  CurrencyDisplay,
  StatusBadge,
  ActivityFeed,
} from "@/components/ui-custom";
import {
  DeleteProductButton,
  ProductBarcodeCard,
  ProductQrCard,
} from "@/features/products/components";
import { getProductById } from "@/features/products/actions/product-actions";
import {
  getBarcodeValue,
  getStockState,
} from "@/features/products/utils/product-helpers";
import { formatDate, formatDateTime } from "@/lib/utils";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const barcodeValue = getBarcodeValue(product.barcode, product.sku, product.id);
  const stockStatus = getStockState(product.quantity, product.minimumStock);

  const activityItems = product.stockMovements.map(
    (item: (typeof product.stockMovements)[number]) => ({
      id: item.id,
      title: item.type.replace(/_/g, " "),
      description: `${item.beforeQty} → ${item.afterQty} (${item.quantity})`,
      time: formatDateTime(item.createdAt),
      type: "info" as const,
    })
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={product.name}
        badge={product.status}
        description={`SKU: ${product.sku}`}
        actions={
          <>
            <Link href="/products">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>

            <Link href={`/products/${product.id}/edit`}>
              <Button>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </Link>

            <DeleteProductButton
              productId={product.id}
              productName={product.name}
              redirectTo="/products"
            />
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Selling Price</p>
            <div className="mt-1 text-2xl font-bold">
              <CurrencyDisplay amount={product.sellingPrice} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Purchase Price</p>
            <div className="mt-1 text-2xl font-bold">
              <CurrencyDisplay amount={product.purchasePrice} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Current Stock</p>
            <div className="mt-1 text-2xl font-bold">{product.quantity}</div>
            <div className="mt-2">
              <StatusBadge status={stockStatus} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Variants</p>
            <div className="mt-1 text-2xl font-bold">
              {product.variants.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Product Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <InfoItem label="Category" value={product.category.name} />
              <InfoItem label="Brand" value={product.brand?.name ?? "-"} />
              <InfoItem label="Supplier" value={product.supplier?.name ?? "-"} />
              <InfoItem label="Barcode" value={product.barcode ?? "-"} />
              <InfoItem label="Batch Number" value={product.batchNumber ?? "-"} />
              <InfoItem label="Unit" value={product.unit} />
              <InfoItem label="Color" value={product.color ?? "-"} />
              <InfoItem label="Size" value={product.size ?? "-"} />
              <InfoItem
                label="Weight"
                value={product.weight ? String(product.weight) : "-"}
              />
              <InfoItem
                label="Minimum Stock"
                value={String(product.minimumStock)}
              />
              <InfoItem
                label="Expiry Date"
                value={product.expiryDate ? formatDate(product.expiryDate) : "-"}
              />
              <InfoItem label="Active" value={product.isActive ? "Yes" : "No"} />
              <InfoItem
                label="Created At"
                value={formatDateTime(product.createdAt)}
              />
              <InfoItem
                label="Updated At"
                value={formatDateTime(product.updatedAt)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {product.description || "No description available."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Images</CardTitle>
            </CardHeader>
            <CardContent>
              {product.images.length === 0 ? (
                <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                  No images added.
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {product.images.map((image: string, index: number) => (
                    <div
                      key={`${image}-${index}`}
                      className="overflow-hidden rounded-xl border"
                    >
                      <div className="aspect-video bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Variants</CardTitle>
            </CardHeader>
            <CardContent>
              {product.variants.length === 0 ? (
                <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                  No variants available.
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {product.variants.map(
                    (variant: (typeof product.variants)[number]) => (
                      <div
                        key={variant.id}
                        className="rounded-xl border p-4 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-medium">{variant.name}</p>
                          <StatusBadge
                            status={variant.isActive ? "active" : "inactive"}
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          SKU: {variant.sku}
                        </p>
                        <p className="text-sm">
                          Price: <CurrencyDisplay amount={variant.price} />
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Qty: {variant.quantity}
                        </p>
                      </div>
                    )
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <ProductBarcodeCard value={barcodeValue} />
          <ProductQrCard value={barcodeValue} />
          <ActivityFeed title="Stock Activity" items={activityItems} />
        </div>
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