import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui-custom";
import { CustomerForm } from "@/features/customers/components";
import { getCustomerById } from "@/features/customers/actions/customer-actions";

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await getCustomerById(id);

  if (!customer) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit ${customer.name}`}
        description="Update customer profile, membership and loyalty details."
      />
      <CustomerForm
        mode="edit"
        customerId={customer.id}
        initialData={{
          name: customer.name,
          email: customer.email ?? "",
          phone: customer.phone ?? "",
          address: customer.address ?? "",
          membershipLevel: customer.membershipLevel,
          loyaltyPoints: customer.loyaltyPoints,
          creditBalance: customer.creditBalance,
          isActive: customer.isActive,
        }}
      />
    </div>
  );
}