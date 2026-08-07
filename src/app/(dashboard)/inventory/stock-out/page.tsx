import { PageHeader } from "@/components/ui-custom";
import { StockMovementForm } from "@/features/inventory/components";
import { getProductsForSelect } from "@/features/inventory/actions/inventory-actions";

export default async function StockOutPage() {
  const products = await getProductsForSelect();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock Out"
        description="Remove stock from products (damaged, expired, etc.)."
      />
      <StockMovementForm
        mode="out"
        defaultType="DAMAGED"
        products={products}
      />
    </div>
  );
}