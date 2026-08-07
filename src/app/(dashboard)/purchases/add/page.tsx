import { PageHeader } from "@/components/ui-custom";
import { PurchaseForm } from "@/features/purchases/components";
import { getPurchaseFormData } from "@/features/purchases/actions/purchase-actions";

export default async function AddPurchasePage() {
  const { suppliers, products } = await getPurchaseFormData();

  return (
    <div className="space-y-6">
      <PageHeader title="New Purchase Order" />
      <PurchaseForm suppliers={suppliers} products={products} />
    </div>
  );
}