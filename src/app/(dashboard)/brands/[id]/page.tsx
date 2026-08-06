import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui-custom";
import { BrandForm } from "@/features/brands/components";
import { getBrandById } from "@/features/brands/actions/brand-actions";

export default async function EditBrandPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const brand = await getBrandById(id);

  if (!brand) notFound();

  return (
    <div className="space-y-6">
      <PageHeader title={`Edit ${brand.name}`} />
      <BrandForm
        mode="edit"
        brandId={brand.id}
        initialData={{
          name: brand.name,
          description: brand.description ?? "",
          logo: brand.logo ?? "",
          isActive: brand.isActive,
        }}
      />
    </div>
  );
}