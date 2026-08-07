import { PageHeader } from "@/components/ui-custom";
import { Card, CardContent } from "@/components/ui/card";
import { getExpiredProducts } from "@/features/inventory/actions/inventory-actions";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export default async function ExpiredPage() {
  const expired = await getExpiredProducts();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expired Products"
        badge={`${expired.length}`}
        description="Products that have passed their expiry date."
      />
      <Card>
        <CardContent className="p-5">
          {expired.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No expired products found 🎉
            </p>
          ) : (
            <div className="space-y-3">
              {expired.map(
                (product: (typeof expired)[number]) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between rounded-xl border p-4"
                  >
                    <div>
                      <p className="font-semibold">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.category.name} · SKU: {product.sku}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="destructive" className="text-xs">
                        Expired
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {product.expiryDate
                          ? formatDate(product.expiryDate)
                          : "-"}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}