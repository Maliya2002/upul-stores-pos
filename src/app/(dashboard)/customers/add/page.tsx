import { PageHeader } from "@/components/ui-custom";
import { CustomerForm } from "@/features/customers/components";

export default function AddCustomerPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Customer"
        description="Create a new customer profile with membership and loyalty details."
      />
      <CustomerForm mode="create" />
    </div>
  );
}