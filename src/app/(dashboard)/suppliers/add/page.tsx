import { PageHeader } from "@/components/ui-custom";
import { SupplierForm } from "@/features/suppliers/components";

export default function AddSupplierPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Supplier"
        description="Create a new supplier record."
      />
      <SupplierForm mode="create" />
    </div>
  );
}