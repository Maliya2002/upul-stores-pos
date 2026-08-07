import { PageHeader } from "@/components/ui-custom";
import { StockMovementForm } from "@/features/inventory/components";
import { getProductsForSelect } from "@/features/inventory/actions/inventory-actions";

export default async function StockInPage() {
  const products = await getProductsForSelect();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock In"
        description="Add stock to existing products."
      />
      <StockMovementForm
        mode="in"
        defaultType="PURCHASE"
        products={products}
      />
    </div>
  );
}