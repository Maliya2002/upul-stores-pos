import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui-custom";
import { SupplierForm } from "@/features/suppliers/components";
import { getSupplierById } from "@/features/suppliers/actions/supplier-actions";

export default async function EditSupplierPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supplier = await getSupplierById(id);

  if (!supplier) notFound();

  return (
    <div className="space-y-6">
      <PageHeader title={`Edit ${supplier.name}`} />
      <SupplierForm
        mode="edit"
        supplierId={supplier.id}
        initialData={{
          name: supplier.name,
          email: supplier.email ?? "",
          phone: supplier.phone,
          address: supplier.address ?? "",
          company: supplier.company ?? "",
          taxNumber: supplier.taxNumber ?? "",
          isActive: supplier.isActive,
        }}
      />
    </div>
  );
}