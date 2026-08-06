import { PageHeader } from "@/components/ui-custom";
import { BrandForm } from "@/features/brands/components";

export default function AddBrandPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Add Brand" />
      <BrandForm mode="create" />
    </div>
  );
}